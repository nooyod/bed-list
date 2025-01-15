declare module 'react-apexcharts' {
  import { Component } from 'react';
  import { ApexOptions } from 'apexcharts';

  interface Props {
    options: ApexOptions;
    series: ApexOptions['series'];
    type: 'line' | 'area' | 'bar' | 'histogram' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar' | 'rangeBar' | 'treemap' | 'boxPlot' | 'polarArea';
    width?: string | number;
    height?: string | number;
  }

  export default class ReactApexChart extends Component<Props> {}
}