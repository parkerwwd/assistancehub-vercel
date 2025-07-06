
import React from 'react';
import { useParams } from 'react-router-dom';
import StatePage from '@/components/state/StatePage';
import { getStateData, getTopCities } from '@/components/state/StateData';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';
  
  console.log('🏛️ State page loaded for:', stateName);
  
  const stateData = getStateData(stateName);
  const topCities = getTopCities(stateName);

  return (
    <StatePage 
      stateName={stateName}
      stateData={stateData}
      topCities={topCities}
    />
  );
};

export default State;
