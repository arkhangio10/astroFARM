import { BookOpen, Shield, Globe, Database, ExternalLink } from 'lucide-react';

export default function DataAndPrinciplesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Data & Principles
          </h1>
          <p className="text-xl text-gray-600">
            Transparency, ethics, and responsible use of NASA data
          </p>
        </div>

        {/* FAIR/CARE Principles */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-farm-blue" />
              <h2 className="text-2xl font-bold text-gray-800">FAIR & CARE Principles</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">FAIR Data Principles</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Findable:</strong> Data is easily discoverable and accessible</li>
                  <li><strong>Accessible:</strong> Data can be retrieved and used by humans and machines</li>
                  <li><strong>Interoperable:</strong> Data can be integrated with other datasets</li>
                  <li><strong>Reusable:</strong> Data can be used for future research and applications</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">CARE Data Principles</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Collective Benefit:</strong> Data use benefits Indigenous communities</li>
                  <li><strong>Authority to Control:</strong> Indigenous rights to data governance</li>
                  <li><strong>Responsibility:</strong> Ethical use and protection of Indigenous data</li>
                  <li><strong>Ethics:</strong> Respect for Indigenous values and rights</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* NASA Data Attribution */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-8 h-8 text-farm-green" />
              <h2 className="text-2xl font-bold text-gray-800">NASA Data Sources</h2>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-farm-blue pl-4">
                <h3 className="text-lg font-semibold text-gray-700">MODIS NDVI (MCD13Q1)</h3>
                <p className="text-gray-600 mb-2">
                  Normalized Difference Vegetation Index at 250m resolution, 16-day composite
                </p>
                <p className="text-sm text-gray-500">
                  Source: NASA Land Processes Distributed Active Archive Center (LP DAAC)
                </p>
              </div>
              
              <div className="border-l-4 border-farm-green pl-4">
                <h3 className="text-lg font-semibold text-gray-700">SMAP Soil Moisture</h3>
                <p className="text-gray-600 mb-2">
                  Soil moisture content at ~1km resolution via Crop-CASMA
                </p>
                <p className="text-sm text-gray-500">
                  Source: NASA Soil Moisture Active Passive (SMAP) mission
                </p>
              </div>
              
              <div className="border-l-4 border-farm-red pl-4">
                <h3 className="text-lg font-semibold text-gray-700">MODIS Temperature (MOD11A2)</h3>
                <p className="text-gray-600 mb-2">
                  Land Surface Temperature at 1km resolution, 8-day composite
                </p>
                <p className="text-sm text-gray-500">
                  Source: NASA Land Processes Distributed Active Archive Center (LP DAAC)
                </p>
              </div>
              
              <div className="border-l-4 border-farm-gold pl-4">
                <h3 className="text-lg font-semibold text-gray-700">GPM Precipitation (IMERG)</h3>
                <p className="text-gray-600 mb-2">
                  Global precipitation at 0.1° resolution, 30-minute intervals
                </p>
                <p className="text-sm text-gray-500">
                  Source: NASA Global Precipitation Measurement (GPM) mission
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Limitations */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-farm-red" />
              <h2 className="text-2xl font-bold text-gray-800">Data Limitations & Disclaimers</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Limitations</h3>
                <ul className="space-y-1 text-yellow-700">
                  <li>• Satellite data has inherent latency (1-2 days for processing)</li>
                  <li>• Spatial resolution varies (250m-1km) - pixels represent large areas</li>
                  <li>• Cloud cover affects data quality and availability</li>
                  <li>• Data is for educational purposes only, not for operational farming decisions</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📊 Data Quality</h3>
                <ul className="space-y-1 text-blue-700">
                  <li>• All data is pre-processed and quality-controlled by NASA</li>
                  <li>• Missing data due to clouds is clearly indicated</li>
                  <li>• Temporal resolution varies by dataset (8-16 day composites)</li>
                  <li>• Regional coverage limited to Central Valley, California for MVP</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Purpose */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-farm-purple" />
              <h2 className="text-2xl font-bold text-gray-800">Educational Purpose</h2>
            </div>
            
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                AstroFarm is designed as an educational tool to help students and the general public 
                understand sustainable farming practices and the role of satellite data in agriculture. 
                The game simulates farming decisions based on real NASA data, but should not be used 
                for actual farming operations.
              </p>
              
              <p className="mb-4">
                This simulation helps users learn about:
              </p>
              
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Water management and irrigation efficiency</li>
                <li>Soil health and fertilization practices</li>
                <li>Environmental impact of farming decisions</li>
                <li>Climate data interpretation and limitations</li>
                <li>Sustainable agriculture principles</li>
              </ul>
              
              <p>
                For real farming decisions, always consult with agricultural experts and use 
                current, local data sources.
              </p>
            </div>
          </div>
        </section>

        {/* Links and Resources */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Resources</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">NASA Data Portals</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://earthdata.nasa.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-farm-blue hover:text-blue-600 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      NASA Earthdata
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://lpdaac.usgs.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-farm-blue hover:text-blue-600 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      LP DAAC
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://smap.jpl.nasa.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-farm-blue hover:text-blue-600 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      SMAP Mission
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Educational Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://www.nasa.gov/audience/foreducators/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-farm-blue hover:text-blue-600 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      NASA Education
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://climate.nasa.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-farm-blue hover:text-blue-600 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      NASA Climate
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.usda.gov/topics/farming" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-farm-blue hover:text-blue-600 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      USDA Farming Resources
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            AstroFarm is an educational simulation game. All NASA data is used in accordance with 
            NASA&apos;s data usage policies and guidelines.
          </p>
          <p className="mt-2">
            © 2025 AstroFarm Team. Built for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

