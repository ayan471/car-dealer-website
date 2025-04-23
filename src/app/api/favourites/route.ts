import { routes } from "@/config/routes";
import { Favourites } from "@/config/types";
import { redis } from "@/lib/redis-store";
import { setSourceId } from "@/lib/source-id";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const validateIdSchema = z.object({ id: z.number().int() });

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { data, error } = z.object({ id: z.number().int() }).safeParse(body);

  if (!data) {
    return NextResponse.json({ error: error?.message }, { status: 400 });
  }

  if (typeof data.id !== "number") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const sourceId = await setSourceId();

  const storedFavourites = await redis.get<Favourites>(sourceId);
  const favourites: Favourites = storedFavourites || { ids: [] };

  if (favourites.ids.includes(data.id)) {
    favourites.ids = favourites.ids.filter((favId) => favId !== data.id);
  } else {
    favourites.ids.push(data.id);
  }

  await redis.set(sourceId, favourites);

  revalidatePath(routes.favourites);

  return NextResponse.json({ ids: favourites.ids }, { status: 200 });
};
