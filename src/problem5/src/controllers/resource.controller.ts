import { Request, Response } from 'express';
import Resource, { IResource } from '../models/resource.model';
import {
  CreateResourceDto,
  QueryResourcesFilterDto,
  ResourceIdDto,
  UpdateResourceDto,
} from '../dtos/resource.dto';

// Create a resource
export const createResource = async (req: Request, res: Response) => {
  try {
    const { owner, type, details, amount } = req.body as CreateResourceDto;
    const newResource = new Resource({ owner, type, details, amount });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource', error });
  }
};

// List resources with basic filters (e.g., by owner or type)
export const listResources = async (req: Request, res: Response) => {
  try {
    const { owner, type } = req.query as QueryResourcesFilterDto;
    const filter: any = {};
    if (owner) filter.owner = owner as string;
    if (type) filter.type = type as string;

    const resources = await Resource.find(filter);

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error listing resources', error });
  }
};

// Get details of a resource
export const getResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.query as any as ResourceIdDto;
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error getting resource', error });
  }
};

// Update a resource
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { resourceId, owner, type, details, amount } =
      req.body as UpdateResourceDto;
    const updateObject: any = {};
    if (owner) updateObject.owner = owner;
    if (type) updateObject.type = type;
    if (details) updateObject.details = details;
    if (amount) updateObject.amount = amount;

    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      updateObject,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(200).json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error });
  }
};

// Delete a resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body as ResourceIdDto;
    const deletedResource = await Resource.findByIdAndDelete(resourceId);
    if (!deletedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error });
  }
};
