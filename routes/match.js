import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../src/validation/matches.js";
import { getMatchStatus } from "../src/utils/match-status.js";
import { db } from "../src/db/db.js";
import { matches } from "../src/db/schema.js";
import { desc } from "drizzle-orm";

export const matchRoutes = Router();

const MAX_LIMIT = 100;

matchRoutes.get("/", async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query parameters",
            details: JSON.strinyfy(parsed.error)
        });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy(desc(matches.createdAt))
            .limit(limit);

        res.json({ data });
    } catch (e) {
        res.status(500).json({
            error: "Failed to fetch matches",
            details: String(e),
        });
    }
});


matchRoutes.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: parsed.error,
        });
    }

    const {
        startTime,
        endTime,
        homeScore,
        awayScore,
        ...rest
    } = parsed.data;

    try {
        const [event] = await db
            .insert(matches)
            .values({
                ...rest,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                status: getMatchStatus(startTime, endTime),
            })
            .returning();

        res.status(201).json({ data: event });
    } catch (e) {
        res.status(500).json({
            error: "Failed to create match",
            details: String(e),
        });
    }
});
