import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function useUserMap() {
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/chat/users`)
      .then((res) => res.json())
      .then((users) => {
        const map: Record<string, string> = {};
        users.forEach((u: any) => {
          map[u.id] = u.username;
        });
        setUserMap(map);
      })
      .catch(() => setUserMap({}));
  }, []);

  return userMap;
}
