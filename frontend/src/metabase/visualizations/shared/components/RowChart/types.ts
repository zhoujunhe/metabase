import { AxisStyle, ChartFont, GoalStyle } from "../../types/style";

export type XValue = number | null;
export type YValue = string | number | boolean;

export type Series<TDatum, TSeriesInfo = unknown> = {
  seriesKey: string;
  seriesName: string;
  xAccessor: (datum: TDatum) => XValue;
  yAccessor: (datum: TDatum) => YValue;
  seriesInfo?: TSeriesInfo;
};

export type BarData<TDatum> = {
  xValue: {
    value: number;
    start: number;
    end: number;
    isNegative: boolean;
    isBorderValue?: boolean;
  } | null;
  yValue: YValue;
  originalDatum?: TDatum;
  datumIndex?: number;
};

export type SeriesData<TDatum> = {
  key: string;
  color: string;
  bars: BarData<TDatum>[];
};

export type RowChartTheme = {
  axis: AxisStyle;
  dataLabels: ChartFont;
  goal: GoalStyle;
  grid: {
    color: string;
  };
};

export type StackOffset = "diverging" | "expand" | null;
