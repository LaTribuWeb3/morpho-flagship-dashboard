/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography } from '@mui/material';
import { AxisConfig, LineChart, LineSeriesType, mangoFusionPalette } from '@mui/x-charts';

export interface GraphProperties {
  title: string;
  xAxisLabel: string;
  xAxisData: number[];
  leftYAxis: {
    min?: number;
    max?: number;
    label?: string;
    formatter: ((value: any) => string) | undefined;
  };
  rightYAxis?: {
    min?: number;
    max?: number;
    label?: string;
    formatter: ((value: any) => string) | undefined;
  };
  leftAxisSeries: {
    label: string;
    data: number[];
    formatter: ((value: any) => string) | undefined;
  }[];
  rightAxisSeries?: {
    label: string;
    data: number[];
    formatter: ((value: any) => string) | undefined;
  }[];
}

function dateFormatter(timestampSec: number): string {
  const date = new Date(timestampSec * 1000);
  const year = date.toLocaleString('default', { year: 'numeric' });
  const month = date.toLocaleString('default', {
    month: '2-digit'
  });
  const day = date.toLocaleString('default', { day: '2-digit' });

  return [year, month, day].join('/');
  return new Date(timestampSec * 1000).toLocaleDateString('default', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });
}

export default function Graph(props: GraphProperties) {
  const yAxisConfigs: AxisConfig[] = [
    {
      id: 'leftAxisId',
      min: props.leftYAxis.min,
      max: props.leftYAxis.max,
      label: props.leftYAxis.label,
      valueFormatter: props.leftYAxis.formatter
    }
  ];

  if (props.rightYAxis) {
    yAxisConfigs.push({
      id: 'rightAxisId',
      min: props.rightYAxis.min,
      max: props.rightYAxis.max,
      label: props.rightYAxis.label,
      valueFormatter: props.rightYAxis.formatter
    });
  }

  const series: LineSeriesType[] = [];

  for (const serie of props.leftAxisSeries) {
    series.push({
      type: 'line',
      label: serie.label,
      data: serie.data,
      valueFormatter: serie.formatter,
      showMark: false,
      yAxisKey: 'leftAxisId'
    });
  }

  if (props.rightAxisSeries) {
    for (const serie of props.rightAxisSeries) {
      series.push({
        type: 'line',
        label: serie.label,
        data: serie.data,
        valueFormatter: serie.formatter,
        yAxisKey: 'rightAxisId',
        showMark: false
      });
    }
  }

  return (
    <Box>
      <Typography textAlign={'center'} mt={2}>
        {props.title}
      </Typography>
      <LineChart
        colors={mangoFusionPalette}
        margin={{ top: 70 }}
        xAxis={[
          {
            scaleType: 'utc',
            label: props.xAxisLabel,
            data: props.xAxisData,
            valueFormatter: dateFormatter,
            tickMinStep: 250000,
            min: props.xAxisData[0],
            max: props.xAxisData.at(-1)
          }
        ]}
        yAxis={yAxisConfigs}
        rightAxis={props.rightYAxis ? 'rightAxisId' : null}
        series={series}
        height={450}
      />
    </Box>
  );
}
