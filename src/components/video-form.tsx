import { Bot, Check, CheckCircle, FileVideo, FileVolume2, HardDriveDownload, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { loadFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util'
import { api } from "@/lib/axios";

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success'

type UploadVideoProps = {
    onVideoUploaded: (id: string) => void;
}

export function UploadVideoForm(props: UploadVideoProps) {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>("waiting")
    const promptInputRef = useRef<HTMLTextAreaElement>(null);

    async function convertVideoToAudio(video: File) {
        const ffmpeg = await loadFFmpeg();

        await ffmpeg.writeFile('input.mp4', await fetchFile(video));

        ffmpeg.on('log', log => console.log(log))

        ffmpeg.on('progress', progress => {
            console.log(`Convert Progress: ${Math.round(progress.progress * 100)}`)
        })

        await ffmpeg.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            'output.mp3'
        ])

        const data = await ffmpeg.readFile('output.mp3');

        const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
        const audioFile = new File([audioFileBlob], 'audio.mp3', { type: 'audio/mpeg' })

        console.log(`convert finished`)

        return audioFile
    }

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget;

        if (!files)
            return

        const selectedFile = files[0]
        setVideoFile(selectedFile)
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const prompt = promptInputRef.current?.value;

        if (!videoFile) {
            return;
        }

        //converter video em audio

        setStatus('converting')
        const audioFile = await convertVideoToAudio(videoFile);

        const data = new FormData();

        data.append('file', audioFile);
        setStatus('uploading')

        const response = await api.post('/videos', data);

        const videoId = response.data.data.id;

        setStatus('generating')

        await api.post(`/videos/${videoId}/transcriptions`, {
            prompt
        });

        setStatus('success')

        props.onVideoUploaded(videoId)
    }

    const previewURL = useMemo(() => {
        if (!videoFile) {
            return null
        }
        return URL.createObjectURL(videoFile);
    }, [videoFile])

    return (
        <form className="space-y-6" onSubmit={handleUploadVideo}>
            <label htmlFor="video"
                className="relative border flex w-full rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/10"
            >
                {previewURL ? (
                    <video src={previewURL} controls={false} className="aspect-video pointer-events-none absolute inset-0" />
                ) : (
                    <>
                        <FileVideo className="w-4 h-4" />
                        Selecione um video
                    </>
                )}
            </label>
            <input type="file" id="video" onChange={handleFileSelected} accept="video/mp4" className="sr-only" />

            <Separator></Separator>

            <div className="space-y-2">
                <Label htmlFor="transcriprion_prompt">Prompt de transcricao</Label>
                <Textarea
                    id="transcriprion_prompt"
                    className="h-20 resize-none leading-relaxed"
                    ref={promptInputRef}
                    placeholder="Inclua palavras chaves mencionadas no video separadas por virgula (,)"
                />
            </div>
            <Button type="submit" disabled={status !== "waiting"} variant={status === "success" ? 'default' : 'secondary'} className={`flex w-full items-center justify-center`}>
                {
                    status === 'converting' ? (
                        <>
                            Convertendo em áudio <FileVolume2 className="h-4 w-4 ml-2" />
                        </>
                    ) : status === 'uploading' ? (
                        <>
                            Gravando áudio <HardDriveDownload className="h-4 w-4 ml-2" />
                        </>
                    ) : status === 'generating' ? (
                        <>
                            Entendendo o vídeo <Bot className="h-4 w-4 ml-2" />
                        </>
                    ) : status === 'success' ? (
                        <>
                            Sucesso! <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                    ) : (
                        <>
                            Carregar vídeo <Upload className="h-4 w-4 ml-2" />
                        </>
                    )
                }
            </Button>
        </form>
    )
}