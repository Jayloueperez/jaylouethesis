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

interface TalentEventContextValue {
  talent: TalentSchema | null;
  loading: boolean;
}

const TalentEventContext = createContext<TalentEventContextValue>({
  talent: null,
  loading: false,
});

interface TalentEventProviderProps {
  talentId: string;
  talentType: TalentTypeSchema;
  children?: ReactNode;
}

function TalentEventProvider(props: TalentEventProviderProps) {
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
    <TalentEventContext.Provider value={{ talent, loading }}>
      {children}
    </TalentEventContext.Provider>
  );
}

const useTalentEventContext = () => useContext(TalentEventContext);

export { TalentEventProvider, useTalentEventContext };
