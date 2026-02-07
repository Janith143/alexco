import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Contact Us</h1>
            <p className="text-slate-600 mb-10">We're here to help. Reach out to us for any inquiries or support.</p>

            <div className="grid md:grid-cols-3 gap-12">
                {/* Contact Information */}
                <div className="md:col-span-1 space-y-8">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Visit Us</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                123 Main Street,<br />
                                Colombo 03, Sri Lanka
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                            <p className="text-slate-600 text-sm">
                                <a href="tel:+94112345678" className="hover:text-blue-600 transition-colors">+94 11 234 5678</a><br />
                                <a href="tel:+94771234567" className="hover:text-blue-600 transition-colors">+94 77 123 4567</a>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                            <p className="text-slate-600 text-sm">
                                <a href="mailto:sales@alexco.lk" className="hover:text-blue-600 transition-colors">sales@alexco.lk</a><br />
                                <a href="mailto:support@alexco.lk" className="hover:text-blue-600 transition-colors">support@alexco.lk</a>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Opening Hours</h3>
                            <p className="text-slate-600 text-sm">
                                Mon - Fri: 8:30 AM - 5:30 PM<br />
                                Sat: 9:00 AM - 2:00 PM<br />
                                Sun: Closed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">First Name</label>
                                <Input placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Last Name</label>
                                <Input placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <Input type="email" placeholder="john@example.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Subject</label>
                            <Input placeholder="Inquiry about solar systems..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Message</label>
                            <Textarea placeholder="How can we help you?" className="min-h-[150px]" />
                        </div>

                        <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">Send Message</Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
