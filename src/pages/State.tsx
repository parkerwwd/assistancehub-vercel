
import React from 'react';
import { useParams } from 'react-router-dom';
import StatePage from '@/components/state/StatePage';
import { getStateData, getTopCities } from '@/components/state/StateData';
import { usePHAData } from '@/hooks/usePHAData';
import { filterPHAAgenciesByState } from '@/utils/mapUtils';

const State = () => {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeURIComponent(state) : '';
  
  console.log('🏛️ State page loaded for:', stateName);

  // Get PHA data for the state
  const { allPHAAgencies, loading: phaLoading } = usePHAData();
  
  // Filter PHA agencies by state
  const statePHAAgencies = React.useMemo(() => {
    if (!stateName || !allPHAAgencies.length) return [];
    return filterPHAAgenciesByState(allPHAAgencies, stateName);
  }, [stateName, allPHAAgencies]);

  console.log('🏛️ Found', statePHAAgencies.length, 'PHA agencies for', stateName);

  // Generate state data with actual PHA agencies (not just count)
  const stateData = getStateData(stateName, statePHAAgencies);
  
  // Generate cities data from actual PHA agencies
  const topCities = getTopCities(stateName, statePHAAgencies);

  return (
    <StatePage 
      stateName={stateName}
      stateData={stateData}
      topCities={topCities}
      phaAgencies={statePHAAgencies}
      phaLoading={phaLoading}
    />
  );
};

export default State;
