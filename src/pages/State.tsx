
import React from 'react';
import { useParams } from 'react-router-dom';
import StatePage from '@/components/state/StatePage';
import { getStateData, getTopCities } from '@/components/state/StateData';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';
  
  const stateData = getStateData();
  const topCities = getTopCities();

  return (
    <StatePage 
      stateName={stateName}
      stateData={stateData}
      topCities={topCities}
    />
  );
};

export default State;
