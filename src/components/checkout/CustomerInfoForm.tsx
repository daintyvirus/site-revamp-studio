import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface CustomerInfoFormProps {
  info: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
}

export default function CustomerInfoForm({ info, onChange }: CustomerInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Full Name"
            value={info.name}
            onChange={(e) => onChange({ ...info, name: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={info.email}
            onChange={(e) => onChange({ ...info, email: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2 sm:w-1/2">
        <Label htmlFor="phone">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Mobile Number"
          value={info.phone}
          onChange={(e) => onChange({ ...info, phone: e.target.value })}
          required
        />
      </div>
    </div>
  );
}
