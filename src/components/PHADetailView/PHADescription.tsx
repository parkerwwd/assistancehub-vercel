import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { FileText } from "lucide-react";

type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

interface PHADescriptionProps {
  office: PHAAgency;
}

const PHADescription: React.FC<PHADescriptionProps> = ({ office }) => {
  // Generate a unique AI-written description for each PHA with variations
  const generateDescription = (office: PHAAgency) => {
    const phaName = office.name || 'Housing Authority';
    const city = office.city || 'the area';
    const state = office.state || 'the region';
    
    // City-specific personalizations for major metropolitan areas
    const getCityPersonalization = (city: string, state: string) => {
      const cityLower = city.toLowerCase();
      
      // Major city nicknames and characteristics
      const cityPersonalizations: { [key: string]: { nickname: string; characteristics: string[] } } = {
        'chicago': {
          nickname: 'the Windy City',
          characteristics: [
            'dynamic neighborhoods from Lincoln Park to Bronzeville',
            'diverse communities spanning from the Loop to the South Side',
            'vibrant areas from downtown to the outlying wards'
          ]
        },
        'new york': {
          nickname: 'the Big Apple',
          characteristics: [
            'five boroughs with distinct housing needs',
            'bustling neighborhoods from Manhattan to Queens',
            'diverse communities across all five boroughs'
          ]
        },
        'los angeles': {
          nickname: 'the City of Angels',
          characteristics: [
            'sprawling metropolitan areas from downtown to the coast',
            'diverse neighborhoods from Hollywood to East LA',
            'communities throughout the greater LA basin'
          ]
        },
        'philadelphia': {
          nickname: 'the City of Brotherly Love',
          characteristics: [
            'historic neighborhoods with rich cultural heritage',
            'communities from Center City to North Philadelphia',
            'diverse areas with deep community roots'
          ]
        },
        'san francisco': {
          nickname: 'the Golden Gate City',
          characteristics: [
            'unique neighborhoods with distinct character',
            'communities throughout the Bay Area peninsula',
            'diverse districts from SOMA to the Richmond'
          ]
        },
        'boston': {
          nickname: 'Beantown',
          characteristics: [
            'historic neighborhoods with modern housing needs',
            'communities from Back Bay to Roxbury',
            'diverse areas throughout the metropolitan region'
          ]
        },
        'seattle': {
          nickname: 'the Emerald City',
          characteristics: [
            'growing neighborhoods from Capitol Hill to South Seattle',
            'dynamic communities throughout the Puget Sound region',
            'diverse areas from downtown to the surrounding districts'
          ]
        },
        'miami': {
          nickname: 'the Magic City',
          characteristics: [
            'vibrant communities from South Beach to Liberty City',
            'diverse neighborhoods reflecting the city\'s international character',
            'growing areas throughout Miami-Dade County'
          ]
        },
        'detroit': {
          nickname: 'the Motor City',
          characteristics: [
            'resilient neighborhoods undergoing revitalization',
            'communities with rich industrial heritage',
            'diverse areas focusing on renewal and growth'
          ]
        },
        'nashville': {
          nickname: 'Music City',
          characteristics: [
            'growing neighborhoods from downtown to the suburbs',
            'communities balancing tradition with rapid growth',
            'diverse areas throughout Davidson County'
          ]
        },
        'las vegas': {
          nickname: 'the Entertainment Capital',
          characteristics: [
            'rapidly expanding communities beyond the Strip',
            'diverse neighborhoods throughout Clark County',
            'growing residential areas serving working families'
          ]
        },
        'new orleans': {
          nickname: 'the Big Easy',
          characteristics: [
            'historic neighborhoods with unique cultural identity',
            'communities throughout the Crescent City',
            'diverse areas from the French Quarter to New Orleans East'
          ]
        },
        'denver': {
          nickname: 'the Mile High City',
          characteristics: [
            'growing neighborhoods from downtown to the suburbs',
            'communities throughout the Front Range region',
            'diverse areas experiencing significant growth'
          ]
        },
        'atlanta': {
          nickname: 'the Peach City',
          characteristics: [
            'dynamic neighborhoods from Midtown to the surrounding metro',
            'communities throughout the greater Atlanta area',
            'diverse districts serving the Southeast\'s major hub'
          ]
        },
        'portland': {
          nickname: 'the Rose City',
          characteristics: [
            'unique neighborhoods with distinct character',
            'communities throughout the Pacific Northwest metro',
            'diverse areas from downtown to the outer districts'
          ]
        }
      };
      
      const personalization = cityPersonalizations[cityLower];
      if (personalization) {
        const characteristicIndex = Math.abs(phaName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % personalization.characteristics.length;
        return {
          cityRef: `${city}, ${personalization.nickname},`,
          characteristic: personalization.characteristics[characteristicIndex]
        };
      }
      
      return {
        cityRef: `${city}, ${state}`,
        characteristic: 'diverse neighborhoods throughout the metropolitan area'
      };
    };
    
    const cityInfo = getCityPersonalization(city, state);
    
    // Create a simple hash from the PHA name to ensure consistent but varied descriptions
    const nameHash = phaName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Different opening sentences (updated to use city personalization)
    const openings = [
      `The ${phaName} stands as a cornerstone of affordable housing in ${cityInfo.cityRef} committed to serving the community's most vulnerable residents.`,
      `Established to address housing challenges in ${cityInfo.cityRef} the ${phaName} has become a trusted partner for families seeking affordable housing solutions.`,
      `The ${phaName} plays a crucial role in ${cityInfo.cityRef} working tirelessly to bridge the gap between housing needs and available resources.`,
      `As a key housing provider in ${cityInfo.cityRef} the ${phaName} focuses on creating pathways to stable, affordable housing for local residents.`,
      `The ${phaName} serves as a vital community resource in ${cityInfo.cityRef} dedicated to expanding housing opportunities for those who need them most.`,
      `Working at the heart of ${cityInfo.cityRef} the ${phaName} is committed to transforming lives through quality affordable housing programs.`
    ];
    
    // Different middle sections focusing on various aspects (updated with city characteristics)
    const middleSections = [
      `This organization administers a comprehensive range of housing assistance programs, including Housing Choice Vouchers, public housing developments, and specialized programs for seniors and disabled residents. Serving ${cityInfo.characteristic}, their dedicated staff works closely with applicants to navigate the housing process, ensuring families receive the support they need to secure stable housing.`,
      `Through partnerships with local landlords and property owners, they maintain a diverse portfolio of housing options across ${cityInfo.characteristic}. The authority also provides essential supportive services, including housing counseling, maintenance coordination, and community development initiatives that strengthen neighborhoods.`,
      `The organization operates with a focus on both immediate housing needs and long-term community development throughout ${cityInfo.characteristic}. Their programs include not only traditional rental assistance but also homeownership opportunities, housing rehabilitation projects, and initiatives designed to revitalize local communities.`,
      `With a comprehensive approach to housing assistance, they offer everything from emergency housing placement to long-term affordable housing solutions across ${cityInfo.characteristic}. The authority also emphasizes resident services, providing educational programs, job training resources, and connections to community services that help families achieve self-sufficiency.`,
      `Their housing programs are designed to meet diverse community needs throughout ${cityInfo.characteristic}, from young families starting out to seniors seeking accessible housing options. The organization also works on housing preservation efforts, ensuring that existing affordable housing stock remains available and well-maintained for current and future residents.`,
      `The authority takes pride in its resident-centered approach, offering personalized assistance throughout the housing process across ${cityInfo.characteristic}. They collaborate extensively with social service agencies, healthcare providers, and educational institutions to create a comprehensive support network for housing program participants.`
    ];
    
    // Different closing statements
    const closings = [
      `Their ultimate goal is to provide more than just housing – they strive to create communities where families can build better futures and contribute to the social and economic vitality of the region.`,
      `By maintaining high standards for both housing quality and resident services, they ensure that affordable housing remains a stepping stone to greater opportunities and community engagement.`,
      `The organization's commitment extends beyond housing placement to include ongoing support that helps residents maintain housing stability and achieve their personal and professional goals.`,
      `Through innovative programs and community partnerships, they continue to adapt their services to meet evolving housing needs while maintaining a focus on dignity, respect, and resident empowerment.`,
      `Their work creates ripple effects throughout the community, as stable housing enables families to invest in education, career development, and community involvement, strengthening the entire region.`,
      `The authority remains dedicated to expanding access to quality housing while fostering inclusive communities where all residents can thrive regardless of their economic circumstances.`
    ];
    
    // Select variations based on hash to ensure consistency for each PHA
    const openingIndex = nameHash % openings.length;
    const middleIndex = (nameHash * 2) % middleSections.length;
    const closingIndex = (nameHash * 3) % closings.length;
    
    return `${openings[openingIndex]} ${middleSections[middleIndex]} ${closings[closingIndex]}`;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/60 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <FileText className="w-5 h-5 text-blue-600" />
          About This Housing Authority
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed text-sm">
          {generateDescription(office)}
        </p>
      </CardContent>
    </Card>
  );
};

export default PHADescription; 