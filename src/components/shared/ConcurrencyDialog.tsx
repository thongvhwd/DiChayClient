import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConcurrencyDialogProps {
  open: boolean
  onReload: () => void
}

export function ConcurrencyDialog({ open, onReload }: ConcurrencyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Conflict Detected</DialogTitle>
          <DialogDescription>
            This record was modified by someone else while you were editing. You must reload the
            latest version before saving.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onReload}>Reload Latest Version</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
