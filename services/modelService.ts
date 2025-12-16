export interface Model {
  model_name: string;
  version: string;
  task: string;
  description: string;
}

export interface ModelsResponse {
  [key: string]: Model;
}

export const fetchModels = async (): Promise<Model[]> => {
  try {
    const response = await fetch(`${window.location.origin}/api/v2/models`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data: ModelsResponse = await response.json();
    
    // Convert object to array
    return Object.values(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    // Return empty array if fetch fails
    return [];
  }
};
