import {
  Modal,
  ModalClose,
  Sheet,
  Stack,
  Input,
  Typography,
  Button,
} from "@mui/joy";
import { useContext, useState, useEffect } from "react";
import { PlaylistContext } from "../../context/PlaylistContext";
import Cookies from "universal-cookie";

interface CreatePlaylistModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreatePlaylistModal = (props: CreatePlaylistModalProps) => {
  const { service } = useContext(PlaylistContext);
  const [playlistName, setPlaylistName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cookies = new Cookies();

  useEffect(() => {
    // Limpa a mensagem de erro ao abrir o modal
    setErrorMessage(null);
  }, [props.open]);

  const handleCreatePlaylist = async () => {
    // Verifica se o nome da playlist está vazio
    if (!playlistName.trim()) {
      setErrorMessage("O nome da playlist não pode estar vazio");
      return;
    }

    service.createPlaylist({
      name: playlistName,
      createdBy: cookies.get("userId").toString(),
      private: false,
    });

    props.setOpen(false);
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={props.open}
      onClose={() => {
        // Limpa a mensagem de erro ao fechar o modal
        setErrorMessage(null);
        props.setOpen(false);
      }}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          maxWidth: 500,
          minWidth: 400,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="modal-title"
          level="h3"
          textColor="inherit"
          fontWeight="lg"
          mb={4}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          Criar Nova Playlist
        </Typography>
        <Stack spacing={2}>
          <Input
            type="text"
            placeholder="Nome da Playlist"
            value={playlistName}
            data-cy="playlist-name-input"
            onChange={(e) => setPlaylistName(e.target.value)}
          />
          {errorMessage && (
            <Typography
              textColor="red"
              data-cy="error-message"
              sx={{ mb: 2, display: "flex", justifyContent: "center" }}
            >
              {errorMessage}
            </Typography>
          )}
          <Button
            onClick={handleCreatePlaylist}
            variant="outlined"
            color="primary"
            data-cy="create-playlist"
          >
            Criar Playlist
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  );
};

export default CreatePlaylistModal;
