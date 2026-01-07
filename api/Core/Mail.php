<?php
namespace App\Core;

class Mail
{
    const CONTENT_TEXT = 'text/plain';
    const CONTENT_HTML = 'text/html';

    protected string $fromEmail = '';
    protected string $fromName  = '';
    protected array  $to       = [];
    protected array  $cc       = [];
    protected array  $bcc      = [];
    protected ?string $replyTo = null;
    protected string $subject  = '';
    protected string $body     = '';
    protected string $contentType = self::CONTENT_TEXT;
    protected array  $headers  = [];
    protected array  $attachments = [];

    /** @var string|null Dernier message d'erreur */
    protected ?string $lastError = null;

    public function __construct()
    {
        $this->headers = [
            'MIME-Version' => '1.0',
            'X-Mailer'     => 'PHP/' . phpversion(),
        ];
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    public function setFrom(string $email, string $name = ''): self
    {
        $this->fromEmail = $email;
        $this->fromName  = $name;
        return $this;
    }

    public function addTo(string $email, string $name = ''): self
    {
        $this->to[] = [$email, $name];
        return $this;
    }

    public function addCc(string $email, string $name = ''): self
    {
        $this->cc[] = [$email, $name];
        return $this;
    }

    public function addBcc(string $email, string $name = ''): self
    {
        $this->bcc[] = [$email, $name];
        return $this;
    }

    public function setReplyTo(string $email, string $name = ''): self
    {
        $this->replyTo = $this->formatAddress($email, $name);
        return $this;
    }

    public function setSubject(string $subject): self
    {
        $this->subject = $this->encodeHeader($subject);
        return $this;
    }

    public function setBody(string $body, string $contentType = self::CONTENT_TEXT): self
    {
        $this->body        = $body;
        $this->contentType = $contentType;
        return $this;
    }

    public function addAttachment(string $filePath, string $filename = ''): self
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            throw new InvalidArgumentException("Fichier introuvable ou illisible : $filePath");
        }
        $this->attachments[] = [
            'path' => $filePath,
            'name' => $filename ?: basename($filePath),
        ];
        return $this;
    }

    public function send(): bool
    {
        $this->lastError = null;

        // Vérifications préalables
        if (empty($this->fromEmail)) {
            $this->lastError = "Adresse expéditeur manquante.";
            return false;
        }
        if (empty($this->to)) {
            $this->lastError = "Aucun destinataire défini.";
            return false;
        }
        if (empty($this->subject)) {
            $this->lastError = "Sujet manquant.";
            return false;
        }
        if (empty($this->body)) {
            $this->lastError = "Corps du message vide.";
            return false;
        }

        try {
            $boundary = '==='.md5(uniqid('', true)).'===';
            $this->prepareHeaders($boundary);
            $message = $this->buildMessage($boundary);

            $toHeader = implode(', ', array_map(
                fn($r) => $this->formatAddress(...$r),
                $this->to
            ));

            $result = @mail(
                $toHeader,
                $this->subject,
                $message,
                $this->buildHeadersString()
            );

            if (!$result) {
                $this->lastError = "La fonction mail() a échoué. Vérifiez la configuration SMTP/Sendmail.";
            }

            return $result;
        } catch (\Throwable $e) {
            $this->lastError = "Erreur lors de l'envoi : " . $e->getMessage();
            return false;
        }
    }

    protected function prepareHeaders(string $boundary): void
    {
        $this->headers['From'] = $this->formatAddress($this->fromEmail, $this->fromName);

        if ($this->replyTo) {
            $this->headers['Reply-To'] = $this->replyTo;
        }
        if (!empty($this->cc)) {
            $this->headers['Cc'] = implode(', ', array_map(
                fn($r) => $this->formatAddress(...$r),
                $this->cc
            ));
        }
        if (!empty($this->bcc)) {
            $this->headers['Bcc'] = implode(', ', array_map(
                fn($r) => $this->formatAddress(...$r),
                $this->bcc
            ));
        }

        if (empty($this->attachments)) {
            $this->headers['Content-Type'] = "{$this->contentType}; charset=UTF-8";
        } else {
            $this->headers['Content-Type'] = "multipart/mixed; boundary=\"{$boundary}\"";
        }
    }

    protected function buildHeadersString(): string
    {
        return implode("\r\n", array_map(
            fn($k, $v) => "$k: $v",
            array_keys($this->headers),
            $this->headers
        ));
    }

    protected function buildMessage(string $boundary): string
    {
        $eol = "\r\n";
        $body = '';

        if (empty($this->attachments)) {
            $body = $this->body;
        } else {
            $altBoundary = '==='.md5(uniqid('alt', true)).'===';
            $body .= "--{$boundary}{$eol}";
            $body .= "Content-Type: multipart/alternative; boundary=\"{$altBoundary}\"{$eol}{$eol}";

            $body .= "--{$altBoundary}{$eol}";
            $body .= "Content-Type: {$this->contentType}; charset=UTF-8{$eol}{$eol}";
            $body .= $this->body . $eol . $eol;
            $body .= "--{$altBoundary}--{$eol}{$eol}";

            foreach ($this->attachments as $attach) {
                $fileData = chunk_split(base64_encode(file_get_contents($attach['path'])));
                $body   .= "--{$boundary}{$eol}";
                $body   .= "Content-Type: application/octet-stream; name=\"{$attach['name']}\"{$eol}";
                $body   .= "Content-Transfer-Encoding: base64{$eol}";
                $body   .= "Content-Disposition: attachment; filename=\"{$attach['name']}\"{$eol}{$eol}";
                $body   .= $fileData . $eol . $eol;
            }

            $body .= "--{$boundary}--{$eol}";
        }

        return $body;
    }

    protected function formatAddress(string $email, string $name = ''): string
    {
        if ($name === '') {
            return $email;
        }
        return $this->encodeHeader($name) . " <{$email}>";
    }

    protected function encodeHeader(string $value): string
    {
        $maxBytes = 52;
        $bytesLen = strlen($value);
        $parts    = [];

        for ($offset = 0; $offset < $bytesLen; $offset += $maxBytes) {
            $chunk = substr($value, $offset, $maxBytes);
            $parts[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
        }
        return implode("\r\n ", $parts);
    }
}
