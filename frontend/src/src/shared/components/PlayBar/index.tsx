import { mdiPlayOutline, mdiPauseBoxOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { IconButton, LinearProgress, Sheet, Stack, Typography } from "@mui/joy";
import { useState } from "react";
import SongModel from "../../../app/home/models/SongModel";

interface PlayBarProps {
  song: SongModel;
  progress: number;
}

const PlayBar = (props: PlayBarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  return (
    <Sheet
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 16,
        // background: "red",
        p: 2,
      }}
    >
      <Stack>
        <IconButton onClick={togglePlayPause}>
          <Icon
            path={isPlaying ? mdiPauseBoxOutline : mdiPlayOutline}
            size={1.5}
            color="white"
          />
        </IconButton>
      </Stack>

      <Stack sx={{ mx: 6 }}>
        <Typography level="body-sm">{props.song?.artist}</Typography>
        <Typography level="title-md">{props.song?.title}</Typography>
      </Stack>

      <LinearProgress
        sx={{ mr: 4 }}
        determinate
        value={props.progress}
        color="neutral"
        variant="solid"
      />
    </Sheet>
  );
};

export default PlayBar;
