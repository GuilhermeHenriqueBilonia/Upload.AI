import { Button } from "@/components/ui/button";
import { FileVideo, Github, Upload, Wand2 } from 'lucide-react'
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { UploadVideoForm } from "./components/video-form";
import { useState } from "react";
import { PromptSelect } from "./components/prompt-select";
import { useCompletion } from 'ai/react'

export function App() {
  const [temp, setTemp] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)

  const {input, setInput, handleInputChange, handleSubmit, completion, isLoading} = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature: temp
    },
    headers: {
      "Content-Type": 'application/json'
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Upload.AI</h1>
        <div className="flex items-center gap-3">
          <span className="text-small text-muted-foreground">Desenvolvido com ❣️</span>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline">
            <Github className="w-4 h-4 mr-2" />
            Github
          </Button>
        </div>
      </div>
      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-1 flex-col">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea className="w-full h-full resize-none p-5 leading-relaxed" placeholder="inclua o prompt para a IA..." value={input} onChange={handleInputChange} />
            <Textarea className="w-full h-full resize-none p-5 leading-relaxed" readOnly placeholder="resultado gerado pela IA..." value={completion} />
          </div>
          <span className="text-small text-muted-foreground">Lembre-se que você pode utilizar o <span className="text-primary">{`{ transcription }`}</span> para passar a transcrição.</span>
        </div>
        <aside className="w-80 space-y-4">
          <UploadVideoForm onVideoUploaded={setVideoId} />
          <Separator />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="transcriprion_prompt">Prompt</Label>
              <PromptSelect onPromptSelected={setInput} />
              <span className="text-xs italic block text-muted-foreground">voce podera customizar essa opcao em breve</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transcriprion_prompt">Modelo</Label>
              <Select
                disabled
                defaultValue="gpt3.5"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs italic block text-muted-foreground">voce podera customizar essa opcao em breve</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="transcriprion_prompt">Temperatura</Label>
              <Slider min={0} max={1} step={0.1} value={[temp]} onValueChange={value => setTemp(value[0])}>

              </Slider>
              <span className="text-xs italic block text-muted-foreground leading-relaxed">Valores mais altos deixam os valores mais criativos, porem com mais erros.</span>
            </div>
            <Separator />
            <Button type="submit" disabled={isLoading} variant="default" className="flex items-center justify-center w-full">
              Executar
              <Wand2 className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </aside>
      </main>
    </div>
  )
}
