import api from "./api";

export const savePreferences = async (preferenceData) => {
    const response = await api.post("/preferences", preferenceData);
    return response.data;
};

export const getPreferences = async () => {
    const response = await api.get("/preferences");
    return response.data;
};