"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/app/(app)/actions/contact";
import { useFormStatus } from "react-dom";

const initialState = {
    success: false,
    message: "",
    errors: {},
};

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className="ud-btn btn-thm" disabled={pending}>
            {pending ? (
                <>
                    Sending... <i className="fas fa-spinner fa-spin ms-2"></i>
                </>
            ) : (
                <>
                    Send Message <i className="fal fa-arrow-right-long"></i>
                </>
            )}
        </button>
    );
}

export default function ContactForm() {
    const [state, formAction] = useActionState(submitContactForm, initialState);

    return (
        <form action={formAction} className="form-style1">
            <div className="row">
                <div className="col-lg-12">
                    <div className="mb25">
                        <label className="heading-color ff-heading fw600 mb10">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Your Name"
                            required
                        />
                        {state?.errors?.name && (
                            <p className="text-danger mt-1 text-sm">{state.errors.name[0]}</p>
                        )}
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="mb25">
                        <label className="heading-color ff-heading fw600 mb10">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Your Email"
                            required
                        />
                        {state?.errors?.email && (
                            <p className="text-danger mt-1 text-sm">{state.errors.email[0]}</p>
                        )}
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="mb25">
                        <label className="heading-color ff-heading fw600 mb10">Subject</label>
                        <select className="form-control" name="subject" required>
                            <option value="">Select a Subject</option>
                            <option value="Researcher Inquiry">I am a Researcher</option>
                            <option value="Institution Inquiry">I am an Institution/Employer</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Partnership">Partnership Inquiry</option>
                        </select>
                        {state?.errors?.subject && (
                            <p className="text-danger mt-1 text-sm">{state.errors.subject[0]}</p>
                        )}
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="mb25">
                        <label className="heading-color ff-heading fw600 mb10">Message</label>
                        <textarea
                            name="message"
                            cols={30}
                            rows={6}
                            placeholder="Description"
                            required
                        ></textarea>
                        {state?.errors?.message && (
                            <p className="text-danger mt-1 text-sm">{state.errors.message[0]}</p>
                        )}
                    </div>
                </div>
                <div className="col-md-12">
                    {state?.message && (
                        <div
                            className={`alert ${state.success ? "alert-success" : "alert-danger"
                                } mb-4`}
                        >
                            {state.message}
                        </div>
                    )}
                    <div className="d-grid">
                        <SubmitBtn />
                    </div>
                </div>
            </div>
        </form>
    );
}
