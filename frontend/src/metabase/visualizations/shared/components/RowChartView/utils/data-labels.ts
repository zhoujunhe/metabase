import type { ScaleContinuousNumeric } from "d3-scale";
import { BarData } from "../../RowChart/types";

export const getDataLabel = (
  bar: BarData<unknown>,
  xScale: ScaleContinuousNumeric<number, number, never>,
  seriesKey: string,
  isStacked?: boolean,
  labelledSeries?: string[] | null,
) => {
  if (!bar.xValue) {
    return null;
  }
  const { start, end, isNegative } = bar.xValue;
  const value = isNegative ? start : end;

  const [xDomainStart, xDomainEnd] = xScale.domain();
  const isOutOfDomain = value <= xDomainStart || value >= xDomainEnd;

  if (isOutOfDomain) {
    return null;
  }

  const isLabelVisible =
    labelledSeries?.includes(seriesKey) &&
    (!isStacked || bar.xValue.isBorderValue);

  return isLabelVisible ? value : null;
};
