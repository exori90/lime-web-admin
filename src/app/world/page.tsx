'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Note: This requires @microsoft/signalr package to be installed
// Run: npm install @microsoft/signalr
import * as signalR from "@microsoft/signalr";

interface GameState {
  CurrentPhase: string;
  PlayerCount: number;
  GameStarted: boolean;
  LastUpdated: string;
}

export default function WorldPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connectionState, setConnectionState] = useState<string>('Disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !user.isAuthenticated) return;

    const connectToHub = async () => {
      try {
        // Get the JWT token from localStorage
        const authTokens = localStorage.getItem('authTokens');
        if (!authTokens) {
          setError('No authentication token found');
          return;
        }

        const tokens = JSON.parse(authTokens);
        const accessToken = tokens.accessToken;

        if (!accessToken) {
          setError('No access token found');
          return;
        }

        // Create SignalR connection with JWT authentication
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl("http://localhost:5002/hubs/gameworld", {
            accessTokenFactory: () => accessToken
          })
          .withAutomaticReconnect()
          .build();

        // Set up event handlers
        newConnection.on("GameStateUpdate", (gameStateData: GameState) => {
          console.log('🎮 Game state update received:', gameStateData);
          setGameState(gameStateData);
        });

        newConnection.onclose((error) => {
          console.log('🔌 SignalR connection closed:', error);
          setConnectionState('Disconnected');
          if (error) {
            setError(`Connection closed with error: ${error.message}`);
          }
        });

        newConnection.onreconnecting((error) => {
          console.log('🔄 SignalR reconnecting:', error);
          setConnectionState('Reconnecting');
        });

        newConnection.onreconnected((connectionId) => {
          console.log('✅ SignalR reconnected:', connectionId);
          setConnectionState('Connected');
          setError(null);
        });

        // Start the connection
        setConnectionState('Connecting');
        await newConnection.start();
        setConnectionState('Connected');
        setError(null);
        console.log('🎯 Connected to GameWorldHub');

        // Request initial game state
        await newConnection.invoke("RequestGameState");

        setConnection(newConnection);

      } catch (err) {
        console.error('❌ Failed to connect to GameWorldHub:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to game world hub');
        setConnectionState('Disconnected');
      }
    };

    connectToHub();

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user]);

  const handleRequestGameState = async () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke("RequestGameState");
      } catch (err) {
        console.error('Failed to request game state:', err);
        setError(err instanceof Error ? err.message : 'Failed to request game state');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">🔄 Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="font-sans min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🌍 Game World Monitor</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user.username}</span>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Connection Status */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">🔗 Connection Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                connectionState === 'Connected' ? 'bg-green-500' :
                connectionState === 'Connecting' || connectionState === 'Reconnecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></span>
              <span className="text-gray-300">{connectionState}</span>
            </div>
            
            {connectionState === 'Connected' && (
              <button
                onClick={handleRequestGameState}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Refresh State
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded text-sm">
              Error: {error}
            </div>
          )}
        </div>

        {/* Game State Display */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">🎮 Game State</h2>
          
          {gameState ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Current Phase</h3>
                <p className="text-lg font-bold text-white">{gameState.CurrentPhase}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Player Count</h3>
                <p className="text-lg font-bold text-white">{gameState.PlayerCount}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Game Status</h3>
                <p className={`text-lg font-bold ${gameState.GameStarted ? 'text-green-400' : 'text-red-400'}`}>
                  {gameState.GameStarted ? 'Started' : 'Not Started'}
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Last Updated</h3>
                <p className="text-sm text-gray-300">
                  {new Date(gameState.LastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              {connectionState === 'Connected' ? 
                'Waiting for game state updates...' : 
                'Connect to hub to see game state'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}