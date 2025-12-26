import api from '../lib/api';

export interface CodeVersion {
  id: number;
  diagnostic_code_id: number;
  version_number: number;
  code: string;
  description: string;
  category?: string;
  severity?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  change_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  change_summary?: string;
  changed_fields?: string[];
  created_by: number;
  created_at: string;
}

export interface CodeVersionList {
  versions: CodeVersion[];
  total: number;
  code_id: number;
  current_version: number;
}

export interface CodeVersionCompare {
  code_id: number;
  version_from: CodeVersion;
  version_to: CodeVersion;
  differences: Record<string, { old: any; new: any }>;
}

export interface CodeComment {
  id: number;
  diagnostic_code_id: number;
  version_id?: number;
  content: string;
  is_resolved: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CodeCommentList {
  comments: CodeComment[];
  total: number;
  unresolved_count: number;
}

const versionService = {
  async getVersionHistory(codeId: number, skip = 0, limit = 50): Promise<CodeVersionList> {
    const response = await api.get(`/codes/${codeId}/history`, {
      params: { skip, limit },
    });
    return response.data;
  },

  async getVersion(codeId: number, versionId: number): Promise<CodeVersion> {
    const response = await api.get(`/codes/${codeId}/history/${versionId}`);
    return response.data;
  },

  async compareVersions(
    codeId: number,
    fromVersion: number,
    toVersion: number
  ): Promise<CodeVersionCompare> {
    const response = await api.get(`/codes/${codeId}/compare`, {
      params: { from_version: fromVersion, to_version: toVersion },
    });
    return response.data;
  },

  async restoreVersion(
    codeId: number,
    versionId: number,
    comment?: string
  ): Promise<CodeVersion> {
    const response = await api.post(`/codes/${codeId}/restore`, {
      version_id: versionId,
      comment,
    });
    return response.data;
  },

  async getComments(
    codeId: number,
    versionId?: number,
    includeResolved = true,
    skip = 0,
    limit = 50
  ): Promise<CodeCommentList> {
    const response = await api.get(`/codes/${codeId}/comments`, {
      params: { version_id: versionId, include_resolved: includeResolved, skip, limit },
    });
    return response.data;
  },

  async createComment(
    codeId: number,
    content: string,
    versionId?: number
  ): Promise<CodeComment> {
    const response = await api.post(`/codes/${codeId}/comments`, {
      content,
      version_id: versionId,
    });
    return response.data;
  },

  async updateComment(
    commentId: number,
    data: { content?: string; is_resolved?: boolean }
  ): Promise<CodeComment> {
    const response = await api.put(`/codes/comments/${commentId}`, data);
    return response.data;
  },

  async deleteComment(commentId: number): Promise<void> {
    await api.delete(`/codes/comments/${commentId}`);
  },
};

export default versionService;
