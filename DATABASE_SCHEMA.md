# Configuração do Banco de Dados (Supabase/PostgreSQL)

## Tabelas Principais

```sql
-- Perfil de Usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'gerente', 'programador', 'operador', 'acabamento')),
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Máquinas
CREATE TABLE machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Router, Laser CO2, Laser Fiber
  status TEXT DEFAULT 'idle', -- idle, production, setup, maintenance, offline
  last_maintenance TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Materiais e Biblioteca Técnica
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  thickness DECIMAL, -- em mm
  unit TEXT DEFAULT 'chapa',
  -- Parâmetros Técnicos (JSON para flexibilidade entre Router e Laser)
  tech_params JSONB DEFAULT '{
    "rpm": 0,
    "feed_rate": 0,
    "plunge_rate": 0,
    "power": 0,
    "passes": 1,
    "tool_suggested": ""
  }'::jsonb,
  can_rotate BOOLEAN DEFAULT true,
  can_mirror BOOLEAN DEFAULT true,
  grain_direction TEXT, -- horizontal, vertical, none
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ordens de Serviço (OS)
CREATE TABLE work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number SERIAL,
  client_name TEXT,
  description TEXT,
  priority INTEGER DEFAULT 1, -- 1: Normal, 2: Urgente, 3: Crítico
  status TEXT DEFAULT 'pending', -- pending, programming, production, finishing, completed, cancelled
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Log de Operação (Cronômetro)
CREATE TABLE production_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES work_orders(id),
  machine_id UUID REFERENCES machines(id),
  user_id UUID REFERENCES profiles(id),
  log_type TEXT CHECK (log_type IN ('setup', 'production', 'pause', 'adjustment')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  waste_material_m2 DECIMAL DEFAULT 0
);
```
