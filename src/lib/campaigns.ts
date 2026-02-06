import fs from 'fs'
import path from 'path'
import { Campaign, CampaignStatus } from './types'

const DATA_PATH = path.join(process.cwd(), 'data', 'campaigns.json')

export function loadCampaigns(): Campaign[] {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return []
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load campaigns:', error)
    return []
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  try {
    const dir = path.dirname(DATA_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(campaigns, null, 2))
  } catch (error) {
    console.error('Failed to save campaigns:', error)
    throw error
  }
}

export function getCampaignById(id: string): Campaign | undefined {
  const campaigns = loadCampaigns()
  return campaigns.find(c => c.id === id)
}

export function getCampaignsByProject(projectId: string): Campaign[] {
  const campaigns = loadCampaigns()
  return campaigns.filter(c => c.projectId === projectId)
}

export function getCampaignsByStatus(status: CampaignStatus): Campaign[] {
  const campaigns = loadCampaigns()
  return campaigns.filter(c => c.status === status)
}

export function createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign {
  const campaigns = loadCampaigns()
  const now = new Date().toISOString()
  
  const campaign: Campaign = {
    ...data,
    id: `camp-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  
  campaigns.push(campaign)
  saveCampaigns(campaigns)
  return campaign
}

export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
  const campaigns = loadCampaigns()
  const index = campaigns.findIndex(c => c.id === id)
  
  if (index === -1) return null
  
  campaigns[index] = {
    ...campaigns[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveCampaigns(campaigns)
  return campaigns[index]
}

export function deleteCampaign(id: string): boolean {
  const campaigns = loadCampaigns()
  const filtered = campaigns.filter(c => c.id !== id)
  
  if (filtered.length === campaigns.length) return false
  
  saveCampaigns(filtered)
  return true
}

export function addContentToCampaign(campaignId: string, contentId: string): Campaign | null {
  const campaigns = loadCampaigns()
  const index = campaigns.findIndex(c => c.id === campaignId)
  
  if (index === -1) return null
  
  if (!campaigns[index].contentIds.includes(contentId)) {
    campaigns[index].contentIds.push(contentId)
    campaigns[index].updatedAt = new Date().toISOString()
    saveCampaigns(campaigns)
  }
  
  return campaigns[index]
}

export function removeContentFromCampaign(campaignId: string, contentId: string): Campaign | null {
  const campaigns = loadCampaigns()
  const index = campaigns.findIndex(c => c.id === campaignId)
  
  if (index === -1) return null
  
  campaigns[index].contentIds = campaigns[index].contentIds.filter(id => id !== contentId)
  campaigns[index].updatedAt = new Date().toISOString()
  saveCampaigns(campaigns)
  
  return campaigns[index]
}
