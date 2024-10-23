import { FileBlockConfig, videoBlockConfig, videoParse } from "@blocknote/core"
import {
  createReactBlockSpec,
  FileBlockWrapper,
  ReactCustomBlockRenderProps,
  VideoToExternalHTML,
} from "@blocknote/react"
import { useState } from "react"
// @ts-ignore
import { RiVideoFill } from "react-icons/ri"

const VideoBlock = (props: ReactCustomBlockRenderProps<typeof videoBlockConfig, any, any>) => {
  return (
    <FileBlockWrapper
      {...(props as any)}
      buttonText={props.editor.dictionary.file_blocks.video.add_button_text}
      buttonIcon={<RiVideoFill size={24} />}
    >
      <VideoPreview block={props.block} editor={props.editor as any} />
    </FileBlockWrapper>
  )
}

const VideoPreview = (
  props: Omit<ReactCustomBlockRenderProps<FileBlockConfig, any, any>, "contentRef">,
) => {
  const [width, setWidth] = useState<number>(
    Math.min(
      props.block.props.previewWidth!,
      props.editor.domElement.firstElementChild!.clientWidth,
    ),
  )

  return (
    <div
      className="flex aspect-video w-full flex-col items-center justify-center border-2 border-dashed p-4"
      style={{ width }}
    >
      <h3 className="text-base font-medium">Your Video</h3>
      <p className="text-pretty text-center text-sm text-muted-foreground">
        The file has been uploaded and is currently processing. You can safely save draft once
        you&apos;re ready.
      </p>
    </div>
  )
}

export const BlockVideoPlayer = createReactBlockSpec(videoBlockConfig, {
  render: VideoBlock,
  parse: videoParse,
  toExternalHTML: VideoToExternalHTML,
})
