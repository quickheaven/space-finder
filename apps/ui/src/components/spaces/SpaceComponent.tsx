import genericImage from "../../assets/generic-photo.jpg";
import { SpaceEntry } from "../model/model";
import "./SpaceComponent.css";

interface SpaceComponentProps extends SpaceEntry {
  reserveSpace: (spaceId: string, spaceName: string) => void;
}

export default function SpaceComponent(props: SpaceComponentProps) {
  function renderImage() {
    if (props.photoUrl) {
      return <img src={props.photoUrl} />;
    } else {
      return <img src={genericImage} />;
    }
  }

  return (
    <div className="spaceComponent">
      {renderImage()}
      <div className="spaceDetails">
        <label className="name">{props.name}</label>
        <label className="location">{props.location}</label>
        <button onClick={() => props.reserveSpace(props.id, props.name)}>
          Reserve
        </button>
      </div>
    </div>
  );
}
