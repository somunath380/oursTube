import { Response } from "express";

export const sseClients = new Map<string, Response>();