import _, { values } from "underscore";
import { stack, stackOffsetDiverging, stackOffsetExpand } from "d3-shape";
import type { Series as D3Series } from "d3-shape";
import d3 from "d3";

import { t } from "ttag";
import {
  ContinuousScaleType,
  Range,
} from "metabase/visualizations/shared/types/scale";
import { isNotNull } from "metabase/core/utils/array";
import { BarData, Series, SeriesData, StackOffset } from "../types";

export const StackOffsetFn = {
  diverging: stackOffsetDiverging,
  expand: stackOffsetExpand,
} as const;

const getGroupedDatumYValue = (
  groupStartingFromIndex: number,
  datumCount: number,
) =>
  groupStartingFromIndex === 0
    ? t`All values (${datumCount})`
    : t`Other (${datumCount})`;

export const calculateStackedBars = <TDatum>(
  data: TDatum[],
  multipleSeries: Series<TDatum>[],
  stackOffset: StackOffset,
  seriesColors: Record<string, string>,
  xScaleType: ContinuousScaleType,
  valuesCountLimit: number,
) => {
  const groupStartingFromIndex = valuesCountLimit - 1;

  const seriesByKey = multipleSeries.reduce<Record<string, Series<TDatum>>>(
    (acc, series) => {
      acc[series.seriesKey] = series;
      return acc;
    },
    {},
  );

  const ungroupedData = data.slice(0, groupStartingFromIndex + 1);
  const groupedData = data.slice(groupStartingFromIndex);
  const defaultXValue = xScaleType === "log" ? 1 : 0;

  const d3Stack = stack<TDatum>()
    .keys(multipleSeries.map(s => s.seriesKey))
    .value((datum, seriesKey) => seriesByKey[seriesKey].xAccessor(datum) ?? 0)
    .offset(StackOffsetFn[stackOffset ?? "diverging"]);

  const stackedData = d3Stack(groupedData);
  const ungroupedStack = d3Stack(ungroupedData);
  const groupedStack = d3Stack(groupedData);

  // For log scale starting value for stack is 1
  // Stacked log charts does not make much sense but we support them, so I replicate the behavior of line/area/bar charts
  if (xScaleType === "log") {
    stackedData[0].forEach((_, index) => {
      stackedData[0][index][0] = 1;
    });
  }

  const getDatumExtent = _.memoize(
    (stackedSeries: D3Series<TDatum, string>[], datumIndex: number) => {
      return d3.extent(stackedSeries.flatMap(series => series[datumIndex]));
    },
    (_series, datumIndex) => datumIndex,
  );

  const seriesData: SeriesData<TDatum>[] = multipleSeries.map(
    (series, seriesIndex) => {
      const bars = data.map<BarData<TDatum>>((originalDatum, datumIndex) => {
        const [datumMin, datumMax] = getDatumExtent(stackedSeries, datumIndex);
        const stackedDatum = stackedSeries[seriesIndex][datumIndex];

        const [xStartValue, xEndValue] = stackedDatum;

        const yValue = series.yAccessor(stackedDatum.data);
        const isNegative = xStartValue < 0;
        const isBorderValue =
          (isNegative && xStartValue === datumMin) ||
          (!isNegative && xEndValue === datumMax);

        return {
          xStartValue,
          xEndValue,
          yValue,
          isNegative,
          originalDatum,
          datumIndex,
          isBorderValue,
        };
      });

      return {
        bars,
        key: series.seriesKey,
        color: seriesColors[series.seriesKey],
      };
    },
  );

  return seriesData;
};

const getXValue = (value: number | null, defaultXValue: number) => {
  if (value == null) {
    return null;
  }

  const isNegative = value < 0;

  const start = isNegative ? value : defaultXValue;
  const end = isNegative ? defaultXValue : value;

  return {
    value,
    start,
    end,
    isNegative,
  };
};

export const trimData = <TDatum>(
  seriesData: SeriesData<TDatum>[],
  valuesCountLimit: number,
) => {
  const dataLength = seriesData[0].bars.length;

  if (dataLength < valuesCountLimit + 1) {
    return seriesData;
  }

  const groupStartingFromIndex = valuesCountLimit - 1;
  return seriesData.map(series => {
    const ungroupedBars = series.bars.slice(0, groupStartingFromIndex);

    return {
      ...series,
    };
  });
};

export const calculateNonStackedBars = <TDatum>(
  data: TDatum[],
  multipleSeries: Series<TDatum>[],
  seriesColors: Record<string, string>,
  xScaleType: ContinuousScaleType,
  valuesCountLimit: number,
) => {
  const groupStartingFromIndex = valuesCountLimit - 1;

  const ungroupedData = data.slice(0, groupStartingFromIndex + 1);
  const groupedData = data.slice(groupStartingFromIndex);
  const defaultXValue = xScaleType === "log" ? 1 : 0;

  const seriesData: SeriesData<TDatum>[] = multipleSeries.map(series => {
    const bars = ungroupedData.map<BarData<TDatum>>((datum, datumIndex) => {
      const datumYValue = series.yAccessor(datum);
      const datumXValue = series.xAccessor(datum);

      const xValue = getXValue(datumXValue, defaultXValue);

      return {
        xValue,
        yValue: datumYValue,
        originalDatum: datum,
        datumIndex,
      };
    });

    // if (groupedData.length > 0) {
    //   const groupedDatumXValue = groupedData.reduce<number | null>(
    //     (groupedDatumX, datum) => {
    //       const xValue = series.xAccessor(datum);
    //       return xValue == null ? groupedDatumX : (groupedDatumX ?? 0) + xValue;
    //     },
    //     null,
    //   );

    //   const groupedDatumYValue =
    //     groupStartingFromIndex === 0
    //       ? t`All values (${data.length})`
    //       : t`Other (${data.length})`;

    //   const groupedBar: BarData<TDatum> = {
    //     yValue: groupedDatumYValue,
    //     xValue: getXValue(groupedDatumXValue, defaultXValue),
    //   };

    //   bars.push(groupedBar);
    // }

    return {
      bars,
      color: seriesColors[series.seriesKey],
      key: series.seriesKey,
    };
  });

  return seriesData;
};
