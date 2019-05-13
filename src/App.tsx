import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { ScaleThreshold } from 'd3-scale';
import { url, colorbrewer } from './constants';

interface AppState {
  error: string;
  data: { baseTemperature: number; monthlyVariance: monthlyVariance[] };
}

interface AppProps {}

interface monthlyVariance {
  year: number;
  month: number;
  variance: number;
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      error: '',
      data: {
        baseTemperature: 0,
        monthlyVariance: []
      }
    };
  }
  componentDidMount = async () => {
    try {
      const data = await axios
        .get(url)
        .then(({ data: { monthlyVariance, baseTemperature } }) => ({
          baseTemperature,
          monthlyVariance: monthlyVariance.map((val: monthlyVariance) => ({
            ...val,
            month: val.month -= 1
          }))
        }));
      this.setState({ data }, () => this.createChart());
    } catch (error) {
      this.setState({ error });
    }
  };
  createChart = () => {
    const { data } = this.state;
    var fontSize = 16;
    var width = 5 * Math.ceil(data.monthlyVariance.length / 12); //1500;
    var height = 33 * 12; //400;
    var padding = {
      left: 9 * fontSize,
      right: 9 * fontSize,
      top: 1 * fontSize,
      bottom: 8 * fontSize
    };
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    const svg = d3
      .select('.svg-container')
      .append('svg')
      .attr('width', width + padding.left + padding.right)
      .attr('height', height + padding.top + padding.bottom);

    //yaxis
    const yScale = d3
      .scaleBand()
      .domain(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']) //months
      .rangeRound([0, height]);

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yScale.domain())
      .tickFormat(month => {
        let date = new Date(0);
        date.setUTCMonth(Number(month));
        return d3.timeFormat('%B')(date);
      })
      .tickSize(11);

    svg
      .append('g')
      .classed('y-axis', true)
      .attr('id', 'y-axis')
      .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
      .call(yAxis)
      .append('text')
      .text('Months')
      .style('text-anchor', 'middle')
      .attr(
        'transform',
        'translate(' + -7 * fontSize + ',' + height / 2 + ')' + 'rotate(-90)'
      );

    //ordinal scale
    const xScale = d3
      .scaleBand()
      .domain(data.monthlyVariance.map(({ year }) => year.toString()))
      .rangeRound([0, width]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        xScale.domain().filter(year => {
          //set ticks to years divisible by 10
          return Number(year) % 10 === 0;
        })
      )
      .tickFormat(year => {
        let date = new Date(0);
        date.setUTCFullYear(Number(year));
        return d3.timeFormat('%Y')(date);
      })
      .tickSize(10);
    svg
      .append('g')
      .classed('x-axis', true)
      .attr('id', 'x-axis')
      .attr(
        'transform',
        'translate(' + padding.left + ',' + (height + padding.top) + ')'
      )
      .call(xAxis)
      .append('text')
      .text('Years')
      .style('text-anchor', 'middle')
      .attr('transform', 'translate(' + width / 2 + ',' + 3 * fontSize + ')');

    const legendColors = colorbrewer.RdYlBu[11].reverse();
    const legendWidth = 400;
    const legendHeight = 300 / legendColors.length;
    const variance = data.monthlyVariance.map(({ variance }) => variance);
    const minTemp = data.baseTemperature + Math.min.apply(null, variance);
    const maxTemp = data.baseTemperature + Math.max.apply(null, variance);

    const legendThreshold = d3
      .scaleThreshold<number, string>()
      .domain(
        (function(min, max, count) {
          let array = [];
          const step = (max - min) / count;
          const base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(minTemp, maxTemp, legendColors.length)
      )
      .range(legendColors);

    const legendX = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, legendWidth]);

    const legendXAxis = d3
      .axisBottom(legendX)
      .tickSize(10)
      .tickValues(legendThreshold.domain())
      .tickFormat(d3.format('.1f'));

    var legend = svg
      .append('g')
      .classed('legend', true)
      .attr('id', 'legend')
      .attr(
        'transform',
        'translate(' +
          padding.left +
          ',' +
          (padding.top + height + padding.bottom - 2 * legendHeight) +
          ')'
      );
  };
  render() {
    return <div className='svg-container' />;
  }
}

export default App;
