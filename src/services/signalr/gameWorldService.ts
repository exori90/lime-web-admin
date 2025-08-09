// GameWorld SignalR service for real-time game state updates
// Note: This requires @microsoft/signalr package to be installed
// Run: npm install @microsoft/signalr
import * as signalR from "@microsoft/signalr";
import { signalRConfigs } from "../api/config";

export interface GameState {
  CurrentPhase: string;
  PlayerCount: number;
  GameStarted: boolean;
  LastUpdated: string;
}

export type GameStateUpdateCallback = (gameState: GameState) => void;
export type ConnectionStateCallback = (state: string) => void;
export type ErrorCallback = (error: string) => void;

export class GameWorldService {
  private connection: signalR.HubConnection | null = null;
  private gameStateCallback?: GameStateUpdateCallback;
  private connectionStateCallback?: ConnectionStateCallback;
  private errorCallback?: ErrorCallback;

  constructor() {
    this.connection = null;
  }

  // Set up event callbacks
  public setCallbacks(
    gameStateCallback: GameStateUpdateCallback,
    connectionStateCallback: ConnectionStateCallback,
    errorCallback: ErrorCallback
  ) {
    this.gameStateCallback = gameStateCallback;
    this.connectionStateCallback = connectionStateCallback;
    this.errorCallback = errorCallback;
  }

  // Connect to the GameWorld SignalR hub
  public async connect(): Promise<void> {
    try {
      // Get JWT token from localStorage
      const authTokens = localStorage.getItem('authTokens');
      if (!authTokens) {
        throw new Error('No authentication token found');
      }

      const tokens = JSON.parse(authTokens);
      const accessToken = tokens.accessToken;

      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Create SignalR connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(signalRConfigs.gameWorld.baseURL, {
          accessTokenFactory: () => accessToken
        })
        .withAutomaticReconnect()
        .build();

      // Set up event handlers
      this.connection.on("GameStateUpdate", (gameStateData: GameState) => {
        console.log('🎮 Game state update received:', gameStateData);
        if (this.gameStateCallback) {
          this.gameStateCallback(gameStateData);
        }
      });

      this.connection.onclose((error) => {
        console.log('🔌 SignalR connection closed:', error);
        if (this.connectionStateCallback) {
          this.connectionStateCallback('Disconnected');
        }
        if (error && this.errorCallback) {
          this.errorCallback(`Connection closed with error: ${error.message}`);
        }
      });

      this.connection.onreconnecting((error) => {
        console.log('🔄 SignalR reconnecting:', error);
        if (this.connectionStateCallback) {
          this.connectionStateCallback('Reconnecting');
        }
      });

      this.connection.onreconnected((connectionId) => {
        console.log('✅ SignalR reconnected:', connectionId);
        if (this.connectionStateCallback) {
          this.connectionStateCallback('Connected');
        }
      });

      // Start the connection
      if (this.connectionStateCallback) {
        this.connectionStateCallback('Connecting');
      }

      await this.connection.start();
      
      if (this.connectionStateCallback) {
        this.connectionStateCallback('Connected');
      }
      
      console.log('🎯 Connected to GameWorldHub');

      // Request initial game state
      await this.requestGameState();

    } catch (error) {
      console.error('❌ Failed to connect to GameWorldHub:', error);
      if (this.errorCallback) {
        this.errorCallback(error instanceof Error ? error.message : 'Failed to connect to game world hub');
      }
      if (this.connectionStateCallback) {
        this.connectionStateCallback('Disconnected');
      }
      throw error;
    }
  }

  // Disconnect from the hub
  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      if (this.connectionStateCallback) {
        this.connectionStateCallback('Disconnected');
      }
    }
  }

  // Request current game state from the hub
  public async requestGameState(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("RequestGameState");
      } catch (error) {
        console.error('Failed to request game state:', error);
        if (this.errorCallback) {
          this.errorCallback(error instanceof Error ? error.message : 'Failed to request game state');
        }
        throw error;
      }
    } else {
      const error = 'Not connected to hub';
      if (this.errorCallback) {
        this.errorCallback(error);
      }
      throw new Error(error);
    }
  }

  // Get current connection state
  public getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    
    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'Connected';
      case signalR.HubConnectionState.Connecting:
        return 'Connecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'Reconnecting';
      case signalR.HubConnectionState.Disconnected:
        return 'Disconnected';
      case signalR.HubConnectionState.Disconnecting:
        return 'Disconnecting';
      default:
        return 'Unknown';
    }
  }

  // Check if connected
  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const gameWorldService = new GameWorldService();