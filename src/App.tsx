import * as SwitchPrimitives from "@radix-ui/react-switch";
import SlackLogo from "./assets/slack.svg";
import PersonalLogo from "./assets/at-sign.svg";

function App() {
  return (
    <div className="bg-black min-h-[200px] h-full w-full border rounded-md border-white border-opacity-20 text-white p-3 flex flex-col space-y-3">
      <div className="flex justify-between mb-2">
        <div className="font-semibold text-sm">Available</div>
        <SwitchPrimitives.Root
          className={
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          }
        >
          <SwitchPrimitives.Thumb
            className={
              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            }
          />
        </SwitchPrimitives.Root>
      </div>
      <div className="flex items-center">
        <div className="bg-slate-800 rounded-full p-1 flex justify-center items-center mr-2 bg-primary">
          <SlackLogo className="w-4 h-3.5"></SlackLogo>
        </div>
        <div className="font-light text-sm">Slack</div>
      </div>
      <div className="flex items-center">
        <div className="bg-slate-800 rounded-full p-1 flex justify-center items-center mr-2 bg-primary">
          <PersonalLogo className="w-4 h-3.5"></PersonalLogo>
        </div>
        <div className="font-light text-sm">Personal</div>
      </div>
    </div>
  );
}

export default App;
