import api from "./api";

export const getIncome = async () => {
    const response = await api.get("/income");
    return response.data;
};