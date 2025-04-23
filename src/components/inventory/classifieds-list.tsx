import type { ClassifiedWithImages, Favourites } from "@/config/types";

import { ClassifiedCard } from "./classified-card";

interface ClassifiedsListProps {
  classifieds: ClassifiedWithImages[];
  favourites: number[];
}

export const ClassifiedsList = (props: ClassifiedsListProps) => {
  const { classifieds, favourites } = props;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {classifieds.map((classified) => {
        return (
          <ClassifiedCard
            key={classified.id}
            classified={classified}
            favourites={favourites}
          />
        );
      })}
    </div>
  );
};
