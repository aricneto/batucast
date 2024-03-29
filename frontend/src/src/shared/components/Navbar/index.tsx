import {
  mdiAccount,
  mdiAccountOutline,
  mdiFire,
  mdiHistory,
  mdiHomeOutline,
  mdiLambda,
  mdiMusicNote,
  mdiSearchWeb,
  mdiStar,
  mdiStarOutline,
  mdiStarThreePointsOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Sheet, Stack, Tooltip } from "@mui/joy";
import { Link, Location, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={6}
    >
      <NavItem
        location={location}
        title="Home"
        path="/feed"
        icon={mdiHomeOutline}
      />
      <NavItem
        location={location}
        title="Search"
        path="/search"
        icon={mdiSearchWeb}
      />
      <NavItem
        location={location}
        title="My Playlists"
        path="/MyPlaylists"
        icon={mdiMusicNote}
      />
      <NavItem
        location={location}
        title="History"
        path="/history"
        icon={mdiHistory}
      />
      <NavItem
        location={location}
        title="Most Played"
        path="/most-played"
        icon={mdiStarOutline}
      />
      <NavItem
        location={location}
        title="My Profile"
        path="/my-profile"
        icon={mdiAccountOutline}
      />
      <NavItem
        location={location}
        title="Hot Page"
        path="/hot"
        icon={mdiFire}
        dataCy="HotPage"
      />
    </Stack>
  );
};

interface NavItemProps {
  path: string;
  icon: string;
  title: string;
  location: Location<any>;
  dataCy?: string;
}

const NavItem = (props: NavItemProps) => {
  const isInRoute = props.path == props.location.pathname;
  return (
    <Link to={props.path} data-cy={props.dataCy}>
      <Tooltip
        title={props.title}
        variant="outlined"
        size="lg"
        arrow
        placement="right"
      >
        <Sheet
          sx={{
            background: isInRoute ? "#5f255a" : "#331030",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 1,
            borderRadius: 8,
            border: isInRoute ? "2px solid #b03da6" : "1px solid #54134e",
          }}
        >
          <Icon path={props.icon} size={1.2} color="white" />
        </Sheet>
      </Tooltip>
    </Link>
  );
};

export default Navbar;
