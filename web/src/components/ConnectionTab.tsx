import React from 'react';
import SearchForm from './SearchForm';
import SearchTable from './SearchTable';
import { Connection } from '../store';

export const ConnectionTab = ({ connection }: { connection: Connection }) => (
  <div>
    <div className="SearchFormWrapper">
      <SearchForm connection={connection} />
    </div>
    <div className="SearchTableWrapper">
      <SearchTable connection={connection} />
    </div>
  </div>
);

export default ConnectionTab;
