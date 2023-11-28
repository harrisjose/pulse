import React, { useCallback, useEffect } from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { ReactComponent as SlackLogo } from "./assets/slack.svg";
import { ReactComponent as PersonalLogo } from "./assets/at-sign.svg";
import { useState } from "react";
import { trpcReact } from "./utils";
import { Connections, Connectors } from "../common/types";

const ApiStatusComponent = ({ active }: { active: boolean }) => {
  return (
    <div className="flex items-center">
      <div
        className={`rounded-full p-1.5 flex justify-center items-center mr-2.5 ${
          active ? "bg-primary" : "bg-slate-800"
        }`}
      >
        <PersonalLogo className="w-4 h-3.5"></PersonalLogo>
      </div>
      <div className="font-light">Personal</div>
    </div>
  );
};

const SlackStatusComponent = ({ active }: { active: boolean }) => {
  return (
    <div className="flex items-center">
      <div
        className={`rounded-full p-1.5 flex justify-center items-center mr-2.5 ${
          active ? "bg-primary" : "bg-slate-800"
        }`}
      >
        <SlackLogo className="w-4 h-3.5"></SlackLogo>
      </div>
      <div className="font-light">Slack</div>
    </div>
  );
};

function App() {
  const [connections, setConnections] = useState<Connections>({});

  const { data } = trpcReact.initial.useQuery();
  useEffect(() => {
    if (data) {
      setConnections(data as Connections);
    }
  }, [data]);

  trpcReact.subscribeStatus.useSubscription(undefined, {
    onData: (data: any) => {
      console.log(data);
      const connection = { [data.name]: data.status };
      setConnections((state) => ({ ...state, ...connection }));
    },
  });

  const isActive = () => {
    return Object.values(connections).every((v) => v);
  };
  const canShow = (name: keyof Connections) => {
    return connections[name] !== undefined;
  };

  const mutation = trpcReact.updateStatus.useMutation();
  const changeStatus = useCallback(
    async (active: boolean) => {
      mutation.mutate({ active });
    },
    [mutation]
  );

  return (
    <div className="min-h-[200px] h-full w-full text-white p-4 flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <div className="font-medium">Available</div>
        <SwitchPrimitives.Root
          checked={isActive()}
          onCheckedChange={(checked) => changeStatus(checked)}
          className={
            "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-white border-opacity-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10"
          }
        >
          <SwitchPrimitives.Thumb
            className={
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            }
          />
        </SwitchPrimitives.Root>
      </div>
      <hr className="opacity-20" />
      {canShow("slack") && (
        <SlackStatusComponent active={connections["slack"]!} />
      )}
      {canShow("api") && <ApiStatusComponent active={connections["api"]!} />}
    </div>
  );
}

export default App;
