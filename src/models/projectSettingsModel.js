import mongoose from "mongoose"
const projectSettingsSchema = new mongoose.Schema({
  launchSettingsId: {
    type: String, 
    required: true,
    unique: true,
  },
  poolKeys: {
    type: String,
    required: true,
  },
  marketID: {
    type: String,
    required: true,
  },
  AMMId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const ProjectSettings =mongoose.models.ProjectSettings|| mongoose.model('ProjectSettings', projectSettingsSchema);

export default ProjectSettings
