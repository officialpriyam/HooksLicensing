'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

type Backup = {
  timestamp: string
  note: string
  type: 'MANUAL' | 'AUTOMATIC'
}

const initialManualBackups: Backup[] = [
  { timestamp: '20250629_211102', note: 'test', type: 'MANUAL' },
  { timestamp: '20250629_202507', note: 'pp', type: 'MANUAL' },
]

const initialAutoBackups: Backup[] = [
  { timestamp: '20250630_003650', note: 'automatic_backup 2025-06-30 00:36:50', type: 'AUTOMATIC' },
  { timestamp: '20250629_233650', note: 'automatic_backup 2025-06-29 23:36:50', type: 'AUTOMATIC' },
]

export default function BackupsPage() {
  const [backupNote, setBackupNote] = useState('')
  const [manualBackups, setManualBackups] = useState<Backup[]>(initialManualBackups)
  const [autoBackups] = useState<Backup[]>(initialAutoBackups)

  // Auto backup settings
  const [autoInterval, setAutoInterval] = useState('1')
  const [autoIntervalUnit, setAutoIntervalUnit] = useState('HOURS')
  const [maxAutoBackups, setMaxAutoBackups] = useState('10')

  const handleCreateBackup = () => {
    if (!backupNote.trim()) {
      toast.error('Please enter a backup note')
      return
    }
    const ts = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .substring(0, 15)
      .replace(/(\d{8})(\d{6})/, '$1_$2')
    setManualBackups([{ timestamp: ts, note: backupNote, type: 'MANUAL' }, ...manualBackups])
    toast.success('Backup created successfully')
    setBackupNote('')
  }

  return (
    <div className="space-y-0 -m-4 md:-m-8">
      {/* Manual Backups Section */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Manual Backups</h2>

        {/* Create form */}
        <div className="flex items-end gap-3 mb-6">
          <div className="space-y-1">
            <Label className="text-slate-300 text-sm">Backup Note</Label>
            <Input
              value={backupNote}
              onChange={(e) => setBackupNote(e.target.value)}
              placeholder=""
              className="bg-slate-800 border-slate-600 text-white w-56"
            />
          </div>
          <Button
            onClick={handleCreateBackup}
            className="bg-white text-black hover:bg-slate-100"
          >
            Create Backup
          </Button>
        </div>

        {/* Manual backups table */}
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">Note</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-slate-300">Download</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manualBackups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 py-6">
                  No manual backups
                </TableCell>
              </TableRow>
            ) : (
              manualBackups.map((backup) => (
                <TableRow key={backup.timestamp} className="border-slate-700 hover:bg-slate-700/30">
                  <TableCell className="text-slate-300 font-mono text-sm">
                    {backup.timestamp}
                  </TableCell>
                  <TableCell className="text-slate-300">{backup.note}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{backup.type}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toast.success(`Downloading ${backup.timestamp}`)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Download
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                      onClick={() => toast.success(`Restoring ${backup.timestamp}`)}
                    >
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Automatic Backups Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Automatic Backups</h2>

        {/* Auto backup settings */}
        <div className="flex items-end gap-3 mb-6 flex-wrap">
          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">Automatic backup every</Label>
            <Input
              type="number"
              value={autoInterval}
              onChange={(e) => setAutoInterval(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white w-24"
              min={1}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">&nbsp;</Label>
            <Select value={autoIntervalUnit} onValueChange={setAutoIntervalUnit}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="HOURS">HOURS</SelectItem>
                <SelectItem value="DAYS">DAYS</SelectItem>
                <SelectItem value="WEEKS">WEEKS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">Max Automatic Backups</Label>
            <Select value={maxAutoBackups} onValueChange={setMaxAutoBackups}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-white text-black hover:bg-slate-100"
            onClick={() => toast.success('Auto backup schedule saved')}
          >
            Save Schedule
          </Button>
        </div>

        {/* Auto backups table */}
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">Note</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-slate-300">Download</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {autoBackups.map((backup) => (
              <TableRow key={backup.timestamp} className="border-slate-700 hover:bg-slate-700/30">
                <TableCell className="text-slate-300 font-mono text-sm">
                  {backup.timestamp}
                </TableCell>
                <TableCell className="text-slate-300">{backup.note}</TableCell>
                <TableCell className="text-slate-400 text-sm">{backup.type}</TableCell>
                <TableCell>
                  <button
                    onClick={() => toast.success(`Downloading ${backup.timestamp}`)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Download
                  </button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                    onClick={() => toast.success(`Restoring ${backup.timestamp}`)}
                  >
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
