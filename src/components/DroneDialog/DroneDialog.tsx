import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import { Drone } from '../../types';

interface DroneDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (drone: Partial<Drone>) => void;
  drone?: Drone;
}

const DroneDialog: React.FC<DroneDialogProps> = ({ open, onClose, onSubmit, drone }) => {
  const [formData, setFormData] = React.useState<Partial<Drone>>({
    name: '',
    droneModel: '',
    status: 'available',
    batteryLevel: 100,
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
  });

  React.useEffect(() => {
    if (drone) {
      setFormData(drone);
    }
  }, [drone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{drone ? 'Edit Drone' : 'Add New Drone'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Model"
              name="droneModel"
              value={formData.droneModel}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in-mission">In Mission</MenuItem>
              <MenuItem value="charging">Charging</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Battery Level"
              name="batteryLevel"
              value={formData.batteryLevel}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100 }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {drone ? 'Save Changes' : 'Add Drone'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DroneDialog; 