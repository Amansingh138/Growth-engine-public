export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    notebook_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    notebook_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    notebook_url?: string | null
                    created_at?: string
                }
            }
            notebooks: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    name: string
                    description: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    name: string
                    description?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                }
            }
            sources: {
                Row: {
                    id: string
                    created_at: string
                    notebook_id: string
                    title: string
                    type: 'url' | 'text'
                    content: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    notebook_id: string
                    title: string
                    type: 'url' | 'text'
                    content: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    notebook_id?: string
                    title?: string
                    type?: 'url' | 'text'
                    content?: string
                }
            }
        }
    }
}
