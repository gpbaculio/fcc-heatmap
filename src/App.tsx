import React, { Component } from 'react';
import axios from 'axios';
import { url } from './constants';

interface AppState {
  error: string;
  data: { baseTemperature: number; monthlyVariance: monthlyVariance[] } | null;
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
      data: null
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
      this.setState({ data });
      console.log('state.data ', this.state.data);
    } catch (error) {
      this.setState({ error });
    }
  };

  render() {
    return <div />;
  }
}

export default App;
