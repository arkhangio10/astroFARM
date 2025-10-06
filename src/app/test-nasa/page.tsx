// Test page for NASA API connection

'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  timestamp: string;
  tests: {
    connection: {
      status: number;
      success: boolean;
      error?: string;
      dataType: string;
      hasData: boolean;
    };
    dates: {
      status: number;
      success: boolean;
      error?: string;
      dataType: string;
      hasData: boolean;
    };
    tiles: {
      success: boolean;
      tiles: string[];
      count: number;
      description: string;
    };
    dataAccess: {
      status: number;
      success: boolean;
      error?: string;
      product: string;
      date: string;
      tile: string;
      hasData: boolean;
    };
    products: {
      success: boolean;
      results: Array<{
        product: string;
        status: number;
        success: boolean;
        error?: string;
        hasData: boolean;
      }>;
    };
  };
  summary: {
    totalTests: number;
    passedTests: number;
    nasaTokenConfigured: boolean;
    tokenLength: number;
    environment: string;
  };
  nasaInfo: {
    baseUrl: string;
    authorizedApplications: string[];
    datasets: Record<string, string>;
  };
}

export default function TestNasaPage() {
  const [results, setResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Fix hydration issue by setting time only on client side
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
  }, []);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/nasa-test');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Test failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          🛰️ NASA Earthdata API Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Test Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Token Status:</strong> 
                <span className="ml-2 text-green-600">✅ Configured</span>
              </p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <p><strong>Base URL:</strong> https://e4ftl01.cr.usgs.gov</p>
              <p><strong>Test Time:</strong> {currentTime || 'Loading...'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Run Tests</h2>
          <p className="text-gray-600 mb-4">
            This will test your NASA Earthdata connection and verify access to satellite data.
          </p>
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {loading ? '🔄 Running Tests...' : '🚀 Run NASA API Tests'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">❌ Test Error</h3>
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Test Results Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{results.summary.passedTests}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{results.summary.totalTests}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {getStatusIcon(results.summary.nasaTokenConfigured)}
                  </div>
                  <div className="text-sm text-gray-600">Token</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((results.summary.passedTests / results.summary.totalTests) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {results.summary.tokenLength}
                  </div>
                  <div className="text-sm text-gray-600">Token Length</div>
                </div>
              </div>
            </div>

            {/* NASA Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🛰️ NASA Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Authorized Applications:</h3>
                  <ul className="text-sm space-y-1">
                    {results.nasaInfo.authorizedApplications.map((app, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Available Datasets:</h3>
                  <ul className="text-sm space-y-1">
                    {Object.entries(results.nasaInfo.datasets).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        <span className="text-blue-600 mr-2">📊</span>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔍 Detailed Test Results</h2>
              <div className="space-y-4">
                {Object.entries(results.tests).map(([testName, testResult]) => (
                  <div key={testName} className="border rounded-lg p-4">
                    <h3 className="font-semibold capitalize mb-2 flex items-center">
                      <span className="mr-2">{getStatusIcon(testResult.success)}</span>
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Status:</strong> 
                        <span className={`ml-2 ${getStatusColor(testResult.success)}`}>
                          {testResult.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      {'status' in testResult && testResult.status && (
                        <div>
                          <strong>HTTP Status:</strong> {testResult.status}
                        </div>
                      )}
                      {'error' in testResult && testResult.error && (
                        <div className="col-span-2">
                          <strong>Error:</strong> 
                          <span className="text-red-600 ml-2">{testResult.error}</span>
                        </div>
                      )}
                      {'dataType' in testResult && testResult.dataType && (
                        <div>
                          <strong>Data Type:</strong> {testResult.dataType}
                        </div>
                      )}
                      {'hasData' in testResult && testResult.hasData !== undefined && (
                        <div>
                          <strong>Has Data:</strong> 
                          <span className={getStatusColor(testResult.hasData)}>
                            {testResult.hasData ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {'tiles' in testResult && testResult.tiles && (
                        <div>
                          <strong>Tiles:</strong> {testResult.tiles.join(', ')}
                        </div>
                      )}
                      {'description' in testResult && testResult.description && (
                        <div className="col-span-2">
                          <strong>Description:</strong> {testResult.description}
                        </div>
                      )}
                      {'results' in testResult && testResult.results && (
                        <div className="col-span-2">
                          <strong>Products Tested:</strong>
                          <div className="mt-2 space-y-1">
                            {testResult.results.map((result: any, index: number) => (
                              <div key={index} className="flex items-center text-xs">
                                <span className="mr-2">{getStatusIcon(result.success)}</span>
                                <strong>{result.product}:</strong> 
                                <span className={`ml-1 ${getStatusColor(result.success)}`}>
                                  {result.success ? 'OK' : 'Failed'}
                                </span>
                                {result.error && (
                                  <span className="ml-2 text-red-600">({result.error})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📋 Raw Response Data</h2>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
