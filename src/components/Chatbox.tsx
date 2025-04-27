import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowUp,
  BriefcaseIcon,
  ChevronDown,
  FlowerIcon,
  HeartIcon,
  LightbulbIcon,
  Mic,
  MountainSnow,
  Pause,
  SettingsIcon,
} from "lucide-react";
import { Textarea } from "./ui/textarea";

type Props = {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isRecording: boolean;
  isLoading: boolean;
};

export default function HeroFormCenterAlignedSearchWithTags({
  startRecording,
  stopRecording,
  isRecording,
  isLoading,
}: Props) {
  return (
    <div className="container mx-auto px-4 pb-5 md:px-6 2xl:max-w-[1400px]">
      <div className="mt-10 sm:mt-20">
        <div className="text-neutral-400 flex justify-center gap-2 items-center text-sm">
          <p className="">Pick a new topic</p>
          <ChevronDown size={14} />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant={"outline"}>
            <BriefcaseIcon className="mr-2 h-auto w-3 flex-shrink-0" />
            Business
          </Button>
          <Button variant={"outline"}>
            <SettingsIcon className="mr-2 h-auto w-3 flex-shrink-0" />
            Strategy
          </Button>
          <Button variant={"outline"}>
            <HeartIcon className="mr-2 h-auto w-3 flex-shrink-0" />
            Health
          </Button>
          <Button variant={"outline"}>
            <LightbulbIcon className="mr-2 h-auto w-3 flex-shrink-0" />
            Creative
          </Button>
          <Button variant={"outline"}>
            <FlowerIcon className="mr-2 h-auto w-3 flex-shrink-0" />
            Environment
          </Button>
          <Button variant={"outline"}>
            <MountainSnow className="mr-2 h-auto w-3 flex-shrink-0" />
            Adventure
          </Button>
        </div>
      </div>

      <div className="relative mx-auto mt-7 max-w-xl sm:mt-12">
        <form>
          <div className="bg-background relative z-10 flex space-x-3 rounded-lg border p-3 shadow-lg">
            <div className="flex-[1_0_0%]">
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                rows={6}
                name="message"
                className="h-full resize-none"
                id="message"
                placeholder="Your message..."
              />
            </div>
            <div className="flex-[0_0_auto] flex flex-col gap-2">
              <Button size={"icon"}>
                <ArrowUp />
              </Button>
              <Button
                size={"icon"}
                type="button"
                variant={isRecording ? "destructive" : "secondary"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}>
                {isRecording ? <Pause /> : <Mic />}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
