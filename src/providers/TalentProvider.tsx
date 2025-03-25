"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { Loading } from "~/components/custom-ui/loading";
import { getTalentRealtime } from "~/lib/firebase/client/firestore";
import { TalentTypeSchema } from "~/schema/data-base";
import { TalentSchema } from "~/schema/data-client";
import { useAppSelector } from "~/store";

interface TalentContextValue {
  talent: TalentSchema | null;
  loading: boolean;
}

const TalentContext = createContext<TalentContextValue>({
  talent: null,
  loading: false,
});

interface TalentProviderProps {
  talentId: string;
  talentType: TalentTypeSchema;
  children?: ReactNode;
}

function TalentProvider(props: TalentProviderProps) {
  const { talentId, talentType, children } = props;

  const [talent, setTalent] = useState<TalentSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { userData } = useAppSelector((state) => state.user);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getTalentRealtime(talentId)((v) => {
      setTalent(v);
      setLoading(false);
    });

    return unsubscribe;
  }, [talentId]);

  useEffect(() => {
    if (!loading && !talent && userData)
      router.replace(`/${userData.role}/${talentType}`);
  }, [loading, router, talent, talentType, userData]);

  if (loading || !talent || !userData) return <Loading />;

  return (
    <TalentContext.Provider value={{ talent, loading }}>
      {children}
    </TalentContext.Provider>
  );
}

const useTalentContext = () => useContext(TalentContext);

export { TalentProvider, useTalentContext };
