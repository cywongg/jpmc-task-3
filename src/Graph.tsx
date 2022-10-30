import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    //Configure the perspective table view of the graph
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Modify/add more attributes to the element
        elem.load(this.table);
        elem.setAttribute('view', 'y_line');
        elem.setAttribute('row-pivots', '["timestamp"]');
        elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
        elem.setAttribute('aggregates', JSON.stringify({
            price_abc: 'avg',
            price_def: 'avg',
            ratio: 'avg',
            timestamp: 'distinct count',
            upper_bound: 'avg',
            lower_bound: 'avg',
            trigger_alert: 'avg'
      }));
    }
  }

  //component lifecycle method that gets executed whenever the component updates (when the graph gets new data)
  componentDidUpdate() {
    if (this.table) {
    //add argument we put in this.table.update
        this.table.update([
            DataManipulator.generateRow(this.props.data),
        ] as unknown as TableData);
    }
  }
}

export default Graph;
