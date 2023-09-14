import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "@/lib/axios";
type PrompsType = {
    id: string;
    title: string;
    template: string;
}

type PromptSelectProps = {
    onPromptSelected: (template: string) => void;
}

export function PromptSelect(props: PromptSelectProps) {
    const [prompts, setPrompts] = useState<PrompsType[] | null>(null)

    useEffect(() => {
        api.get('/getPrompts').then((res) => {
            setPrompts(res.data)
            console.log(res.data)
        })
    }, [])

    function handlePromptSelected(id: string){
        const selectedPrompt = prompts?.find(x => x.id === id)

        if(!selectedPrompt){
            return
        }
        props.onPromptSelected(selectedPrompt.template)

    }
    return (
        <Select
            onValueChange={handlePromptSelected}
        >
            <SelectTrigger>
                <SelectValue placeholder="Selecione um prompt" />
            </SelectTrigger>
            <SelectContent>
                {
                    prompts?.map(prompt => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                            {prompt.title}
                        </SelectItem>
                    ))
                }
                
            </SelectContent>
        </Select>
    )
}