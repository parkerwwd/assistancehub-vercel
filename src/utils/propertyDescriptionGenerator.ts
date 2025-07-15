import { Property } from '@/types/property';

/**
 * Generates an individualized description for a property based on its characteristics
 */
export function generatePropertyDescription(property: Property): string {
  const descriptions: string[] = [];
  
  // Opening based on property type
  if (property.property_type === 'tax_credit') {
    descriptions.push(`${property.name} is a tax credit (LIHTC) property offering affordable housing opportunities`);
  } else if (property.property_type === 'section_8') {
    descriptions.push(`${property.name} is a Section 8 property providing rental assistance for eligible residents`);
  } else if (property.property_type === 'public_housing') {
    descriptions.push(`${property.name} is a public housing community managed by the local housing authority`);
  } else {
    descriptions.push(`${property.name} offers affordable housing options`);
  }
  
  // Location description
  if (property.city && property.state) {
    descriptions.push(`located in ${property.city}, ${property.state}`);
  } else if (property.state) {
    descriptions.push(`located in ${property.state}`);
  }
  
  // Size and availability
  if (property.units_total) {
    const sizeDesc = property.units_total > 100 
      ? 'large community' 
      : property.units_total > 50 
      ? 'mid-sized community' 
      : 'intimate community';
    
    descriptions.push(`This ${sizeDesc} features ${property.units_total} total units`);
    
    if (property.units_available && property.units_available > 0) {
      descriptions.push(`with ${property.units_available} units currently available`);
    }
  }
  
  // Unit types
  if (property.bedroom_types && property.bedroom_types.length > 0) {
    const unitTypes = property.bedroom_types.map(type => {
      switch(type) {
        case 'studio': return 'studio';
        case '1br': return 'one-bedroom';
        case '2br': return 'two-bedroom';
        case '3br': return 'three-bedroom';
        case '4br+': return 'four or more bedroom';
        default: return type;
      }
    });
    
    if (unitTypes.length === 1) {
      descriptions.push(`The property offers ${unitTypes[0]} units`);
    } else {
      const lastUnit = unitTypes.pop();
      descriptions.push(`The property offers ${unitTypes.join(', ')} and ${lastUnit} units`);
    }
  }
  
  // Specific unit distribution if available
  const unitDetails: string[] = [];
  if (property.units_studio) unitDetails.push(`${property.units_studio} studio`);
  if (property.units_1br) unitDetails.push(`${property.units_1br} one-bedroom`);
  if (property.units_2br) unitDetails.push(`${property.units_2br} two-bedroom`);
  if (property.units_3br) unitDetails.push(`${property.units_3br} three-bedroom`);
  if (property.units_4br) unitDetails.push(`${property.units_4br} four-bedroom`);
  
  if (unitDetails.length > 0) {
    descriptions.push(`including ${unitDetails.join(', ')} apartments`);
  }
  
  // Rent information
  if (property.rent_range_min || property.rent_range_max) {
    if (property.rent_range_min && property.rent_range_max) {
      descriptions.push(`Monthly rent ranges from $${property.rent_range_min} to $${property.rent_range_max}`);
    } else if (property.rent_range_min) {
      descriptions.push(`Monthly rent starts at $${property.rent_range_min}`);
    } else if (property.rent_range_max) {
      descriptions.push(`Monthly rent up to $${property.rent_range_max}`);
    }
  }
  
  // Year and history
  if (property.year_put_in_service && property.year_put_in_service > 1900 && property.year_put_in_service <= new Date().getFullYear()) {
    const age = new Date().getFullYear() - property.year_put_in_service;
    if (age < 5) {
      descriptions.push(`This is a newer development, put into service in ${property.year_put_in_service}`);
    } else if (age < 15) {
      descriptions.push(`The property was established in ${property.year_put_in_service}`);
    } else {
      descriptions.push(`Serving the community since ${property.year_put_in_service}`);
    }
  }
  
  // Low income units
  if (property.low_income_units) {
    const percentage = property.units_total ? Math.round((property.low_income_units / property.units_total) * 100) : 0;
    if (percentage > 0) {
      descriptions.push(`with ${percentage}% of units designated for low-income residents`);
    } else {
      descriptions.push(`offering ${property.low_income_units} income-restricted units`);
    }
  }
  
  // Amenities
  if (property.amenities && property.amenities.length > 0) {
    const amenityList = property.amenities.slice(0, 3).join(', ');
    descriptions.push(`Residents enjoy amenities including ${amenityList}`);
    if (property.amenities.length > 3) {
      descriptions.push(`and ${property.amenities.length - 3} more`);
    }
  }
  
  // Accessibility
  if (property.accessibility_features && property.accessibility_features.length > 0) {
    descriptions.push(`The property is equipped with accessibility features including ${property.accessibility_features.slice(0, 2).join(' and ')}`);
  }
  
  // Pet policy
  if (property.pet_policy) {
    if (property.pet_policy.toLowerCase().includes('allowed') || property.pet_policy.toLowerCase().includes('yes')) {
      descriptions.push(`Pets are welcome at this community`);
    } else if (property.pet_policy.toLowerCase().includes('no') || property.pet_policy.toLowerCase().includes('not')) {
      descriptions.push(`Please note that this is a pet-free community`);
    }
  }
  
  // Contact encouragement
  if (property.units_available && property.units_available > 0) {
    descriptions.push(`Contact the property management team today to learn more about available units and schedule a tour`);
  } else {
    descriptions.push(`Contact the property management team to inquire about waitlist options and future availability`);
  }
  
  // Join the descriptions with proper punctuation
  let fullDescription = '';
  for (let i = 0; i < descriptions.length; i++) {
    if (i === 0) {
      fullDescription = descriptions[i];
    } else if (i === 1 && !descriptions[0].endsWith('.')) {
      // Connect location to opening
      fullDescription += ' ' + descriptions[i];
    } else {
      // Check if previous sentence ended with a period
      if (!fullDescription.endsWith('.')) {
        fullDescription += '.';
      }
      fullDescription += ' ' + descriptions[i];
    }
  }
  
  // Ensure the description ends with a period
  if (!fullDescription.endsWith('.')) {
    fullDescription += '.';
  }
  
  return fullDescription;
}

/**
 * Generates a short description for property cards
 */
export function generateShortPropertyDescription(property: Property): string {
  const parts: string[] = [];
  
  // Property type
  if (property.property_type === 'tax_credit') {
    parts.push('Tax credit property');
  } else if (property.property_type === 'section_8') {
    parts.push('Section 8 property');
  } else if (property.property_type === 'public_housing') {
    parts.push('Public housing');
  } else {
    parts.push('Affordable housing');
  }
  
  // Size
  if (property.units_total) {
    parts.push(`with ${property.units_total} units`);
  }
  
  // Availability
  if (property.units_available && property.units_available > 0) {
    parts.push(`(${property.units_available} available)`);
  }
  
  return parts.join(' ');
} 