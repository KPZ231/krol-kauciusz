// ponytail: ręczny stub (Docker/Supabase local niedostępny przy tworzeniu boilerplatu).
// Zastąp docelowo przez: npx supabase gen types typescript --local > src/types/database.ts

export type DepositSource = 'receipt' | 'manual';
export type DepositStatus = 'pending' | 'verified' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nick: string;
          goal_grosze: number;
          created_at: string;
        };
        Insert: never; // profil tworzy trigger on_auth_user_created, nie klient
        Update: {
          nick?: string;
          goal_grosze?: number;
        };
      };
      deposits: {
        Row: {
          id: string;
          user_id: string;
          source: DepositSource;
          status: DepositStatus;
          plastic: number;
          cans: number;
          glass: number;
          receipt_path: string | null;
          created_at: string;
        };
        Insert: never; // zapis wyłącznie przez RPC add_deposit
        Update: never;
      };
    };
    Views: {
      leaderboard: {
        Row: {
          nick: string;
          total_items: number;
        };
      };
    };
    Functions: {
      add_deposit: {
        Args: {
          p_plastic: number;
          p_cans: number;
          p_glass: number;
          p_source: DepositSource;
          p_receipt_path?: string | null;
        };
        Returns: Database['public']['Tables']['deposits']['Row'];
      };
    };
  };
}
