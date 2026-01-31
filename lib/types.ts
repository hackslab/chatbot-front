export interface Admin {
  id: string;
  name: string;
  username: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  contactInfo: string;
  isActive: boolean;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_info: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface OrganizationStorageUsage {
  used_bytes: number;
  limit_bytes: number;
}

export interface Folder {
  id: string;
  name: string;
  organization_id: string;
  total_size_bytes: number;
  created_at?: string;
}

export interface Document {
  id: string;
  filename: string;
  storage_uri: string;
  mime_type: string;
  size_bytes: number;
  organization_id: string;
  folder_id?: string | null;
  created_at: string;
}

export interface AiModel {
  id: string;
  name: string;
  key: string;
  created_at?: string;
}

export interface CreateAiModelDto {
  name: string;
  key: string;
}

export type ApplicationType =
  | "API"
  | "TELEGRAM_BOT"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "FACEBOOK";

export interface Application {
  id: string;
  name: string;
  system_prompt: string;
  ai_model_id: string;
  organization_id: string;
  temperature: number;
  type: ApplicationType;
  api_key?: string | null;
  bot_token?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignedDocument {
  id: string;
  filename: string;
  storage_uri: string;
  mime_type: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface CreateFolderDto {
  name: string;
  organizationId: string;
}

export interface UpdateFolderDto extends Partial<CreateFolderDto> {}

export interface CreateApplicationDto {
  name: string;
  system_prompt: string;
  ai_model_id: string;
  organization_id: string;
  temperature?: number;
  type?: ApplicationType;
  bot_token?: string;
}

export interface UpdateApplicationDto extends Partial<CreateApplicationDto> {}
