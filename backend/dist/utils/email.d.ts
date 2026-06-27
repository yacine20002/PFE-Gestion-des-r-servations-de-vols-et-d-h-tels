interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map